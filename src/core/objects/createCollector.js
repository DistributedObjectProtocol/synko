
dop.core.createCollector = function(queue, index, filter) {
    var collector = new dop.core.collector(queue, index);
    this.filter = filter;
    return collector;
};