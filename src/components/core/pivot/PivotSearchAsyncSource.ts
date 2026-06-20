export class PivotSearchAsyncSource<Item, ColumnKey extends string> {
  data: ReadonlyArray<Readonly<Item>>;
  key: ColumnKey;
  getTextValue: (item: Readonly<Item>, field: ColumnKey) => string;
  values: string[];
  // entries: Array<SearchableEntry<unknown>> = [];
  // filteredEntries: Array<SearchableEntry<unknown>> = [];

  constructor(
    data: ReadonlyArray<Readonly<Item>>,
    key: ColumnKey,
    getTextValue: (item: Readonly<Item>, field: ColumnKey) => string,
  ) {
    this.data = data;
    this.key = key;
    this.getTextValue = getTextValue;
    const unique = new Set<string>();
    data.forEach((row) => {
      unique.add(this.getTextValue(row, key));
    });
    this.values = Array.from(unique).sort();
  }

  getOptions(filter: string): readonly string[] {
    if (!filter) {
      return this.values;
    }
    const lower = filter.toLowerCase();
    return this.values.filter((v) => v.toLowerCase().includes(lower));
  }

  getOptionsForValue(value: string[]): readonly string[] {
    return value.filter((v) => this.values.includes(v));
  }

  // onChange(filteredEntries: Array<SearchableEntry<unknown>>): void {
  //   this.filteredEntries = filteredEntries;
  // }

  // searchImpl(queryString: string, callback: SearchCallback<SearchableEntry<unknown>>, _options: ?void) {
  //   callback([], queryString, 'ACTIVE');
  //   setTimeout(() => {
  //     this.#getCallbackWrapper(callback, queryString);
  //   }, 1);
  // }

  // getBootstrappedEntries(callback: (entries: Array<SearchableEntry<unknown>>) => void): Promise<void> {
  //   return new Promise((resolve) => {
  //     this.#getCallbackWrapper((matches, _, status) => {
  //       if (status === 'COMPLETE') {
  //         callback([...matches]);
  //         resolve();
  //       }
  //     }, '');
  //   });
  // }

  // #getCallbackWrapper(callback: SearchCallback<SearchableEntry<unknown>>, queryString: string) {
  //   const filter = queryString.toLowerCase();
  //   if (this.entries.length === 0) {
  //     const uniqueValues = new Set<string>();
  //     this.data.forEach((row) => {
  //       const value = this.getTextValue(row, this.key);
  //       if (!uniqueValues.has(value)) {
  //         this.entries.push(new SearchableEntry({ title: value, uniqueID: value }));
  //         uniqueValues.add(value);
  //       }
  //     });
  //     this.entries.sort((a, b) => a.getTitle().localeCompare(b.getTitle()));
  //   }
  //   const matches: Array<SearchableEntry<unknown>> =
  //     filter !== ''
  //       ? this.entries.filter((entry) => {
  //           return entry.getTitle().toLowerCase().includes(filter);
  //         })
  //       : this.entries;
  //   callback(matches, queryString, 'COMPLETE');
  // }
}

export class PivotSearchAsyncSourceMap<Item, ColumnKey extends string> {
  data: ReadonlyArray<Readonly<Item>>;
  getTextValue: (item: Readonly<Item>, field: ColumnKey) => string;
  map: Map<ColumnKey, PivotSearchAsyncSource<Item, ColumnKey>> = new Map();

  constructor(data: ReadonlyArray<Readonly<Item>>, getTextValue: (item: Readonly<Item>, field: ColumnKey) => string) {
    this.data = data;
    this.getTextValue = getTextValue;
  }

  getSearchSource(key: ColumnKey): PivotSearchAsyncSource<Item, ColumnKey> {
    let searchSource = this.map.get(key);
    if (!searchSource) {
      searchSource = new PivotSearchAsyncSource<Item, ColumnKey>(this.data, key, this.getTextValue);
      this.map.set(key, searchSource);
    }
    return searchSource;
  }
}
