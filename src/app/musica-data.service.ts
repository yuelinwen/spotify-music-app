import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { SpotifyTokenService } from './spotify-token.service';
import { environment } from './../environments/environment';
import { map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MusicDataService {
  //favouritesList: Array<any> = [];

  constructor(private spotifyToken: SpotifyTokenService, private http: HttpClient) { }

  getNewReleases(): Observable<SpotifyApi.ListOfNewReleasesResponse> {
    return this.spotifyToken.getBearerToken().pipe(mergeMap(token => {
      return this.http.get<any>("https://api.spotify.com/v1/browse/new-releases", { headers: { "Authorization": `Bearer ${token}` } });
    }));
  }

  getArtistById(id: any): Observable<SpotifyApi.SingleArtistResponse> {
    return this.spotifyToken.getBearerToken().pipe(mergeMap(token => {
      return this.http.get<any>(`https://api.spotify.com/v1/artists/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
    }))
  }
  //question no group, only market
  getAlbumsByArtistId(id: any): Observable<any> {
    return this.spotifyToken.getBearerToken().pipe(mergeMap(token => {
      return this.http.get<any>(`https://api.spotify.com/v1/artists/${id}/albums/?market=ES&limit=50`, { headers: { "Authorization": `Bearer ${token}` } });
    }))
  }

  getAlbumById(id: any): Observable<SpotifyApi.SingleAlbumResponse> {
    return this.spotifyToken.getBearerToken().pipe(mergeMap(token => {
      return this.http.get<any>(`https://api.spotify.com/v1/albums/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
    }))
  }

  //only 10 search
  searchArtists(searchString: String): Observable<SpotifyApi.ArtistSearchResponse> {
    return this.spotifyToken.getBearerToken().pipe(mergeMap(token => {
      return this.http.get<any>(`https://api.spotify.com/v1/search?q=${searchString}&type=artist`, { headers: { "Authorization": `Bearer ${token}` } });
    }))
  }
  /*
    addToFavourites(id: any) {
      if (id == null || id > 50) {
        console.log("undefined id， operation failure");
        return false;
      } else {
        this.favouritesList.push(id);
        console.log("added success");
        return true;
      }
    }
  
    removeFromFavourites(id: any): Observable<any> {
      this.favouritesList.splice(this.favouritesList.indexOf(id));
      return this.getFavourites();
    }
  
    getFavourites(): Observable<any> {
      if (this.favouritesList.length > 0) {
        return this.spotifyToken.getBearerToken().pipe(mergeMap(token => {
          return this.http.get<any>(`https://api.spotify.com/v1/tracks?ids=${this.favouritesList.join()}`, { headers: { "Authorization": `Bearer ${token}` } });
        }))
      } else {
        return new Observable(o => o.next([]));
      }
    }*/

  addToFavourites(id): Observable<[String]> {
    // TODO: make a PUT request to environment.userAPIBase/favourites/:id to add id to favourites
    return this.http.put<[String]>(`${environment.userAPIBase}/favourites/${id}`, null);
  }

  removeFromFavourites(id): Observable<any> {
    return this.http.delete<[String]>(`${environment.userAPIBase}/favourites/${id}`).pipe(mergeMap(favouritesArray => {
      // TODO: Perform the same tasks as the original getFavourites() method, only using "favouritesArray" from above, instead of this.favouritesList
      // NOTE: for the empty array, you will need to use o=>o.next({tracks: []}) instead of o=>{o.next([])}
      if (favouritesArray.length > 0) {
        return this.spotifyToken.getBearerToken().pipe(mergeMap(token => {
          return this.http.get<any>(`https://api.spotify.com/v1/tracks?ids=${favouritesArray.join()}`, { headers: { "Authorization": `Bearer ${token}` } });
        }))
      } else {
        return new Observable(o => o.next({ tracks: [] }));
      }
    }));
  }

  getFavourites(): Observable<any> {
    return this.http.get<[String]>(`${environment.userAPIBase}/favourites/`).pipe(mergeMap(favouritesArray => {
      // TODO: Perform the same tasks as the original getFavourites() method, only using "favouritesArray" from above, instead of this.favouritesList
      // NOTE: for the empty array, you will need to use o=>o.next({tracks: []}) instead of o=>{o.next([])}
      if (favouritesArray.length > 0) {
        return this.spotifyToken.getBearerToken().pipe(mergeMap(token => {
          return this.http.get<any>(`https://api.spotify.com/v1/tracks?ids=${favouritesArray.join()}`, { headers: { "Authorization": `Bearer ${token}` } });
        }))
      } else {
        return new Observable(o => o.next({ tracks: [] }));
      }
    }));
  }

  // The 403 the Web API now returns when the app owner has no Premium
  // subscription arrives as an empty page otherwise, with the reason only in
  // the console.
  describeSpotifyError(err: any): string {
    if (err?.status === 403) {
      return "Spotify refused this request (403). The Web API now requires the owner of the developer app to hold an active Premium subscription.";
    }

    if (err?.status === 401) {
      return "Spotify rejected the credentials (401). Check clientID and clientSecret in environment.ts.";
    }

    if (err?.status === 429) {
      return "Spotify is rate limiting this app (429). Try again in a minute.";
    }

    return "Could not load data from Spotify" + (err?.status ? ` (HTTP ${err.status}).` : ".");
  }

  // Spotify stopped returning preview_url on the Web API in late 2024, so the
  // 30-second clip comes from the iTunes Search API instead: no key, no auth,
  // and it sends Access-Control-Allow-Origin: *.
  getPreviewUrl(trackName: string, artistName: string): Observable<string> {
    if (!trackName) {
      return new Observable(o => o.next(null));
    }

    const term = encodeURIComponent(`${artistName || ''} ${trackName}`.trim());

    return this.http.get<any>(`https://itunes.apple.com/search?term=${term}&entity=song&limit=1&country=US`)
      .pipe(map(res => res.resultCount > 0 ? res.results[0].previewUrl : null));
  }
}
