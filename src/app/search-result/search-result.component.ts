import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MusicDataService } from '../musica-data.service';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit, OnDestroy {
  results: any;
  searchQuery: any;
  error: string;

  sub: Subscription;
  constructor(private route: ActivatedRoute, private mds: MusicDataService) { }

  ngOnInit(): void {
    this.sub = this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.error = null;
      this.mds.searchArtists(this.searchQuery).subscribe(
        data => this.results = data,
        err => this.error = this.mds.describeError(err)
      );
    })
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

}
