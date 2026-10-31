import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MusicDataService } from '../musica-data.service';
//import * as albumData from '../data/SearchResultsAlbums.json';
//import * as artistData from '../data/SearchResultsArtist.json';

@Component({
  selector: 'app-artist-discography',
  templateUrl: './artist-discography.component.html',
  styleUrls: ['./artist-discography.component.css']
})
export class ArtistDiscographyComponent implements OnInit, OnDestroy {
  albums: Array<any>;
  artist: any;
  error: string;

  sub: Subscription;

  constructor(private route: ActivatedRoute, private mds: MusicDataService) { }

  ngOnInit(): void {
    //this.albums = (albumData as any).default.albums.items;
    //this.artist = (artistData as any).default;
    let id = this.route.snapshot.params['id'];

    this.sub = this.route.params.subscribe(params => {
      //this.id = +params['id'];
      this.mds.getAlbumsByArtistId(id).subscribe(
        data => this.albums = data.items.filter((thing, index, self) =>
          index === self.findIndex((t) => (
            t.place === thing.place && t.name === thing.name
          ))),
        err => this.error = this.mds.describeSpotifyError(err));
      this.mds.getArtistById(id).subscribe(
        data => this.artist = data,
        err => this.error = this.mds.describeSpotifyError(err));
    });
  }


  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

}
