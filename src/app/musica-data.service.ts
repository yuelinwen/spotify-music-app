import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from './../environments/environment';
import { map, mergeMap } from 'rxjs/operators';

const ITUNES = 'https://itunes.apple.com';

@Injectable({
  providedIn: 'root'
})
export class MusicDataService {

  constructor(private http: HttpClient) { }

  // iTunes hands out a 100px thumbnail. The URL carries its own dimensions, so
  // a bigger one is a string substitution rather than another request.
  private artwork(url: string, size = 600): string {
    return url ? url.replace(/\d+x\d+bb/, `${size}x${size}bb`) : '';
  }

  private toAlbum(r: any) {
    return {
      id: r.collectionId,
      name: r.collectionName,
      artistId: r.artistId,
      artistName: r.artistName,
      artwork: this.artwork(r.artworkUrl100),
      releaseDate: (r.releaseDate || '').slice(0, 10),
      trackCount: r.trackCount,
      genre: r.primaryGenreName,
      copyright: r.copyright,
      url: r.collectionViewUrl
    };
  }

  private toTrack(r: any) {
    return {
      id: r.trackId,
      trackNumber: r.trackNumber,
      name: r.trackName,
      artistId: r.artistId,
      artistName: r.artistName,
      albumId: r.collectionId,
      albumName: r.collectionName,
      artwork: this.artwork(r.artworkUrl100, 100),
      durationMs: r.trackTimeMillis,
      previewUrl: r.previewUrl,
      url: r.trackViewUrl
    };
  }

  getNewReleases(): Observable<any[]> {
    // Proxied by our own API: Apple's chart feed sends no CORS header.
    return this.http.get<any[]>(`${environment.musicAPIBase}/new-releases`).pipe(
      map(results => results.map(r => ({
        id: r.id,
        name: r.name,
        artistId: r.artistId,
        artistName: r.artistName,
        artwork: this.artwork(r.artworkUrl100),
        releaseDate: r.releaseDate,
        genre: r.genres?.[0]?.name,
        url: r.url
      })))
    );
  }

  // Searched as albums with attribute=artistTerm rather than entity=musicArtist:
  // the artist entity carries no artwork, and this page is built around it.
  searchArtists(searchString: String): Observable<any[]> {
    const term = encodeURIComponent(String(searchString || '').trim());

    if (!term) {
      return of([]);
    }

    return this.http.get<any>(`${ITUNES}/search?term=${term}&entity=album&attribute=artistTerm&limit=25&country=US`).pipe(
      map(res => {
        const byArtist = new Map<number, any>();

        for (const r of res.results) {
          if (r.artistId && !byArtist.has(r.artistId)) {
            byArtist.set(r.artistId, {
              id: r.artistId,
              name: r.artistName,
              genre: r.primaryGenreName,
              artwork: this.artwork(r.artworkUrl100),
              url: r.artistViewUrl
            });
          }
        }

        return Array.from(byArtist.values());
      })
    );
  }

  // One lookup returns the artist and their albums together.
  getArtistWithAlbums(id: any): Observable<any> {
    return this.http.get<any>(`${ITUNES}/lookup?id=${id}&entity=album&limit=50&country=US`).pipe(
      map(res => {
        const artistRow = res.results.find((r: any) => r.wrapperType === 'artist');
        const albums = res.results
          .filter((r: any) => r.wrapperType === 'collection')
          .map((r: any) => this.toAlbum(r));

        return {
          artist: artistRow ? {
            id: artistRow.artistId,
            name: artistRow.artistName,
            genre: artistRow.primaryGenreName,
            url: artistRow.artistLinkUrl
          } : null,
          albums
        };
      })
    );
  }

  getAlbumById(id: any): Observable<any> {
    return this.http.get<any>(`${ITUNES}/lookup?id=${id}&entity=song&limit=200&country=US`).pipe(
      map(res => {
        const collection = res.results.find((r: any) => r.wrapperType === 'collection');
        const tracks = res.results
          .filter((r: any) => r.wrapperType === 'track')
          .map((r: any) => this.toTrack(r));

        return { album: collection ? this.toAlbum(collection) : null, tracks };
      })
    );
  }

  addToFavourites(id): Observable<[String]> {
    return this.http.put<[String]>(`${environment.userAPIBase}/favourites/${id}`, null);
  }

  removeFromFavourites(id): Observable<any> {
    return this.http.delete<[String]>(`${environment.userAPIBase}/favourites/${id}`)
      .pipe(mergeMap(favourites => this.lookupTracks(favourites)));
  }

  getFavourites(): Observable<any> {
    return this.http.get<[String]>(`${environment.userAPIBase}/favourites/`)
      .pipe(mergeMap(favourites => this.lookupTracks(favourites)));
  }

  // No entity parameter here: with one, a saved id that happens to name an
  // album would expand into all of its tracks.
  private lookupTracks(ids: any): Observable<any[]> {
    if (!ids || ids.length === 0) {
      return of([]);
    }

    return this.http.get<any>(`${ITUNES}/lookup?id=${ids.join()}&country=US`).pipe(
      map(res => res.results
        .filter((r: any) => r.wrapperType === 'track')
        .map((r: any) => this.toTrack(r)))
    );
  }

  describeError(err: any): string {
    if (err?.status === 429) {
      return "iTunes is rate limiting this app (429). Wait a minute and try again.";
    }

    if (err?.status === 0) {
      return "Could not reach the music service. Check your connection.";
    }

    return "Could not load music data" + (err?.status ? ` (HTTP ${err.status}).` : ".");
  }
}
