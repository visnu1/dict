import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as csv from 'csvtojson'
import { debounceTime, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dict';
  order: 'keyDescOrder' | 'valueAscOrder' | 'originalOrder' | 'keyAscOrder' | 'shuffle' = 'originalOrder';
  words: string[] = [];
  meanings: string[] = [];
  wordObj = {};

  page = 0;
  url: string;
  excelWords = {};
  synonyms = {};

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.http.get('assets/data.json').subscribe(response => {
        if (!response) {
          alert('Something went wrong!');
          return;
        }
        this.words = response['words'];
        this.meanings = response['meanings'];
        this.wordObj = response['wordObj'];
        this.init();
      });
    }
  }

  init() {
    const pages = { 1: '831803340' };
    this.route.queryParams.pipe(debounceTime(100)).subscribe((params: any) => {
      if (params.page) this.page = pages[+params.page] || +params.page;
      this.url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vS6gxiJgtR02vrPodQZQmyMoW9E3Aa8O2qxSJKOU5qpfZW3HhoXh1wFhd3M3rj-Cd3fcoLrFHE-SmkB/pub?gid=${this.page}&single=true&output=csv`;
      this.otherData();
    });
  }

  async otherData() {
    const options = {
      method: 'GET',
      headers: { 'content-type': 'text/csv;charset=UTF-8' }
    }
    try {
      const res = await fetch(this.url, options);
      if (res.status === 200) {
        const sheetData: string = await res.text();
        const jsonArray = await csv().fromString(sheetData);
        this.excelWords = {};
        jsonArray.forEach(obj => {
          let word: string = obj['word'] || "";
          word = word.trim().toLowerCase();
          this.excelWords[word] = obj['meaning'];
          if (obj['synonyms']) {
            const synonyms: string[] = [];
            (<string>obj['synonyms']).split(',').forEach(word => {
              word = word.trim();
              if (word) synonyms.push(word);
            });
            this.synonyms[word] = synonyms;
          }
        });
        console.log(this.synonyms);
        if (this.page === 0)
          this.wordObj = { ...this.wordObj, ...this.excelWords };
      } else {
        console.log(`Error code ${res.status}`);
      }
    } catch (err) {
      console.log(err)
    }
  }


  // Preserve original property order
  originalOrder = (a: any, b: any): number => {
    return 0;
  }

  // Order by ascending property value
  valueAscOrder = (a: any, b: any): number => {
    return a.value.localeCompare(b.value);
  }

  keyAscOrder = (a: any, b: any): number => {
    const aKey = a.key.toLowerCase();
    const bKey = b.key.toLowerCase();
    return aKey < bKey ? -1 : (bKey > aKey ? 1 : 0);
  }

  // Order by descending property key
  keyDescOrder = (a: any, b: any): number => {
    const aKey = a.key.toLowerCase();
    const bKey = b.key.toLowerCase();
    return aKey > b.key ? -1 : (b.key > aKey ? 1 : 0);
  }

  shuffle() {
    const possibility = Math.floor(Math.random() * 2);
    return Math.floor(Math.random() * 2) ? possibility : -1;
  }

  get sortOrder() {
    const sortType: 'keyDescOrder' | 'valueAscOrder' | 'originalOrder' | 'keyAscOrder' | 'shuffle' = this.order;
    return this[sortType];
  }

  onShuffle() {
    this.order = 'shuffle';
  }

  sortTable() {
    if (this.order == 'originalOrder') this.order = 'keyAscOrder';
    else if (this.order == 'keyAscOrder') this.order = 'valueAscOrder';
    else if (this.order == 'valueAscOrder') this.order = 'keyDescOrder';
    else this.order = 'originalOrder';
  }
}
