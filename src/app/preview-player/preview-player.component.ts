import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-preview-player',
  templateUrl: './preview-player.component.html',
  styleUrls: ['./preview-player.component.css']
})
export class PreviewPlayerComponent {
  // The preview URL now arrives with the track itself, so there is nothing to
  // look up and nothing to wait for.
  @Input() track: any;
}
