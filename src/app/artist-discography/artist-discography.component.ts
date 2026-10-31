import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MusicDataService } from '../musica-data.service';

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
    this.sub = this.route.params.subscribe(params => {
      this.mds.getArtistWithAlbums(params['id']).subscribe(
        data => {
          this.artist = data.artist;
          this.albums = data.albums;
        },
        err => this.error = this.mds.describeError(err));
    });
  }


  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

}
