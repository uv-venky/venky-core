export class PivotSearchAsyncSource {
    data;
    key;
    getTextValue;
    values;
    // entries: Array<SearchableEntry<unknown>> = [];
    // filteredEntries: Array<SearchableEntry<unknown>> = [];
    constructor(data, key, getTextValue) {
        this.data = data;
        this.key = key;
        this.getTextValue = getTextValue;
        const unique = new Set();
        data.forEach((row) => {
            unique.add(this.getTextValue(row, key));
        });
        this.values = Array.from(unique).sort();
    }
    getOptions(filter) {
        if (!filter) {
            return this.values;
        }
        const lower = filter.toLowerCase();
        return this.values.filter((v) => v.toLowerCase().includes(lower));
    }
    getOptionsForValue(value) {
        return value.filter((v) => this.values.includes(v));
    }
}
export class PivotSearchAsyncSourceMap {
    data;
    getTextValue;
    map = new Map();
    constructor(data, getTextValue) {
        this.data = data;
        this.getTextValue = getTextValue;
    }
    getSearchSource(key) {
        let searchSource = this.map.get(key);
        if (!searchSource) {
            searchSource = new PivotSearchAsyncSource(this.data, key, this.getTextValue);
            this.map.set(key, searchSource);
        }
        return searchSource;
    }
}
//# sourceMappingURL=PivotSearchAsyncSource.js.map