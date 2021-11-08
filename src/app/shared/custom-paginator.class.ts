import { MatPaginatorIntl } from "@angular/material/paginator";

export class CustomPaginator extends MatPaginatorIntl {

    firstPageLabel = 'עמוד ראשון';
    itemsPerPageLabel = 'מדווחים לעמוד';
    lastPageLabel = 'עמוד אחרון';
    nextPageLabel = 'הבא';
    previousPageLabel = 'הקודם';
    getRangeLabel = (page, pageSize, length) => {
    if (length === 0 || pageSize === 0) {
        return '0 מתוך ' + length;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
    return startIndex + 1 + ' - ' + endIndex + ' מתוך ' + length;
    };
}