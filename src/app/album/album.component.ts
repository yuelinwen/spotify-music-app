import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { MusicDataService } from '../musica-data.service';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css']
})
export class AlbumComponent implements OnInit, OnDestroy {
  album: any;
  tracks: Array<any>;
  error: string;

  id: string;
  sub: Subscription;
  constructor(private msb: MatSnackBar, private route: ActivatedRoute, private router: Router,
    private auth: AuthService, private mds: MusicDataService) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.sub = this.mds.getAlbumById(this.id).subscribe(
      data => {
        this.album = data.album;
        this.tracks = data.tracks;
      },
      err => this.error = this.mds.describeError(err)
    );
  }

  addToFavourites(trackID: string) {
    // Listening is open to everyone; saving a preference is what needs an
    // account, so the prompt happens here rather than at the route.
    if (!this.auth.isAuthenticated()) {
      this.msb.open("Log in to save favourites", "Log in", { duration: 5000 })
        .onAction().subscribe(() => this.router.navigate(['/login']));
      return;
    }

    this.mds.addToFavourites(trackID).subscribe(
      () => {
        this.msb.open("Adding to Favourites...", "Done", { duration: 1500 });
      },
      (err) => {
        this.msb.open("Unable to Favourites...", "Done", { duration: 1500 });
        console.log(err);
      }
    )
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
