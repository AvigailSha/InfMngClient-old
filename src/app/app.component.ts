import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { DomSanitizer } from '@angular/platform-browser';
import { CustomPaginator } from './shared/custom-paginator.class';
import { GetCodecsService } from './core/services/get-codecs.service';

const THUMBUP_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.` +
      `44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5` +
      `1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/>
  </svg>
`;

const SWAP_ICON = `
<svg id="bold" enable-background="new 0 0 24 24" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg">
<path d="m19.31 5.26c-.175 0-.352-.061-.494-.186-1.893-1.66-4.314-2.574-6.816-2.574-2.358 0-4.664.827-6.494 2.33-.321.263-.794.216-1.056-.104s-.216-.793.104-1.056c2.097-1.722 4.742-2.67 7.446-2.67 2.866 0 5.638 1.046 7.805 2.946.311.273.342.747.069 1.059-.148.168-.356.255-.564.255z"/>
<path d="m7.25 5h-2.5c-.414 0-.75-.336-.75-.75v-2.5c0-.303.183-.577.463-.693s.603-.052.817.163l2.5 2.5c.214.214.279.537.163.817s-.39.463-.693.463z"/>
<path d="m12.12 23c-2.867 0-5.639-1.046-7.805-2.946-.312-.273-.342-.747-.069-1.059.273-.311.747-.342 1.059-.069 1.892 1.66 4.312 2.574 6.815 2.574 2.358 0 4.664-.827 6.494-2.33.32-.264.792-.217 1.056.104.263.32.216.793-.104 1.056-2.097 1.722-4.742 2.67-7.446 2.67z"/>
<path d="m19.25 23c-.195 0-.387-.076-.53-.22l-2.5-2.5c-.214-.214-.279-.537-.163-.817s.39-.463.693-.463h2.5c.414 0 .75.336.75.75v2.5c0 .303-.183.577-.463.693-.093.038-.19.057-.287.057z"/>
<circle cx="5" cy="9.5" r="2.5"/><path d="m7.25 13h-4.5c-1.517 0-2.75 1.233-2.75 2.75v.5c0 .414.336.75.75.75h8.5c.414 0 .75-.336.75-.75v-.5c0-1.517-1.233-2.75-2.75-2.75z"/><circle cx="19" cy="9.5" r="2.5"/><path d="m21.25 13h-4.5c-1.517 0-2.75 1.233-2.75 2.75v.5c0 .414.336.75.75.75h8.5c.414 0 .75-.336.75-.75v-.5c0-1.517-1.233-2.75-2.75-2.75z"/>
</svg>
`;

const FIND_ICON = `
<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="462.406px" height="462.406px" viewBox="0 0 462.406 462.406" style="enable-background:new 0 0 462.406 462.406;"
	 xml:space="preserve">
<g>
	<path d="M251.361,163.465c0,33.803-27.396,61.2-61.2,61.2c-33.803,0-61.2-27.397-61.2-61.2s27.397-61.2,61.2-61.2
		C223.958,102.265,251.361,129.669,251.361,163.465z M450.453,450.453c-7.963,7.969-18.408,11.953-28.846,11.953
		c-10.439,0-20.883-3.984-28.846-11.953c0,0-103.918-104.027-104.74-105.047c-29.078,18.557-63.587,29.355-100.641,29.355
		C83.892,374.762,0,290.869,0,187.381C0,83.892,83.898,0,187.381,0s187.381,83.892,187.381,187.38
		c0,37.053-10.799,71.563-29.355,100.641c1.02,0.814,105.047,104.74,105.047,104.74C466.391,408.688,466.391,434.52,450.453,450.453
		z M335.723,187.38c0-81.926-66.416-148.342-148.342-148.342S39.039,105.454,39.039,187.38c0,47.28,22.147,89.366,56.603,116.532
		c4.481-33.211,32.872-58.84,67.313-58.84h54.4c33.028,0,60.534,23.555,66.694,54.773
		C315.67,272.639,335.723,232.363,335.723,187.38z"/>
</g>
</svg>
`;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useValue: new CustomPaginator() }
  ]
})
export class AppComponent implements OnInit{
  title = 'InfMngClient';
  myCustomPaginatorIntl: CustomPaginator;

  constructor(
    matPaginatorIntl: MatPaginatorIntl,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private getCodesService: GetCodecsService) {
      this.myCustomPaginatorIntl = <CustomPaginator>matPaginatorIntl;
      matIconRegistry.addSvgIconLiteral('swap_inf', domSanitizer.bypassSecurityTrustHtml(SWAP_ICON));
      matIconRegistry.addSvgIconLiteral('find_inf', domSanitizer.bypassSecurityTrustHtml(FIND_ICON));
  }

  ngOnInit(): void {
    this.getCodesService.InitCodesc();    
  }

}
