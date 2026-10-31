import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MusicDataService } from '../musica-data.service';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.css']
})
export class FavouritesComponent implements OnInit, OnDestroy {
  favourites: Array<any>;
  error: string;
  sub: Subscription;
  constructor(private mds: MusicDataService) { }

  ngOnInit(): void {
    this.sub = this.mds.getFavourites()
      .subscribe(
        data => this.favourites = data.tracks,
        err => this.error = this.mds.describeSpotifyError(err)
      )
  }

  removeFromFavourites(id: any) {
    this.mds.removeFromFavourites(id)
      .subscribe(
        data => this.favourites = data.tracks,
        err => this.error = this.mds.describeSpotifyError(err)
      );
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

}
