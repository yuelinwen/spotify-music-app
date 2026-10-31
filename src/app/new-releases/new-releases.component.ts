import { Component, OnDestroy, OnInit } from '@angular/core';
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
    this.releasesSub = this.mds.getNewReleases()
      .subscribe(
        data => this.releases = data,
        err => this.error = this.mds.describeError(err)
      )
  }

  ngOnDestroy() {
    this.releasesSub?.unsubscribe();
  }

}
