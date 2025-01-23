const Span = require('../w3c_trace_context-fully_compliant/span.js');

let span1 = new Span('testSpanWOTraceParent');
console.log(span1.getSpanData());

let span2 = new Span('testSpanWTraceParent', '00-84d3bf919e028032cab3128c9a04931d-090f198941a91257-01');
console.log(span2.getSpanData());