import { Component, Input } from '@angular/core';
import { MusicDataService } from '../musica-data.service';

@Component({
  selector: 'app-preview-player',
  templateUrl: './preview-player.component.html',
  styleUrls: ['./preview-player.component.css']
})
export class PreviewPlayerComponent {
  @Input() track: any;

  previewUrl: string;
  state: 'idle' | 'loading' | 'missing' = 'idle';

  constructor(private mds: MusicDataService) { }

  // Looked up on click rather than for every track on the page: iTunes rate
  // limits by IP, and an album view would spend a dozen requests on previews
  // nobody asked to hear.
  loadPreview() {
    this.state = 'loading';

    this.mds.getPreviewUrl(this.track?.name, this.track?.artists?.[0]?.name)
      .subscribe(
        url => {
          this.previewUrl = url;
          this.state = url ? 'idle' : 'missing';
        },
        () => this.state = 'missing'
      );
  }
}
