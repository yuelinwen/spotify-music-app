import { Component, OnDestroy, OnInit } from '@angular/core';
//import * as data from '../data/NewReleasesAlbums.json';
import { MusicDataService } from '../musica-data.service';

@Component({
  selector: 'app-new-releases',
  templateUrl: './new-releases.component.html',
  styleUrls: ['./new-releases.component.css']
})
export class NewReleasesComponent implements OnInit, OnDestroy {
  releases: any;
  error: string;
  releasesSub: any;

  constructor(private mds: MusicDataService) { }

  ngOnInit(): void {
    //this.releases = (data as any).default.albums.items;
    this.releasesSub = this.mds.getNewReleases()
      .subscribe(
        data => {
          this.releases = data.albums.items;
        },
        err => this.error = this.mds.describeSpotifyError(err)
      )
  }

  ngOnDestroy() {
    this.releasesSub?.unsubscribe();
  }

}
