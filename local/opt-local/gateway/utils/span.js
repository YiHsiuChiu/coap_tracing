const crypto = require('crypto');

function generateId(size) {
  return crypto.randomBytes(size).toString('hex');
}

class Span {
  constructor(operationName, traceparent = null) {
    this.traceId = traceparent ? traceparent.slice(3, 35) : generateId(16); 
    this.spanId = generateId(8); 
    this.parentSpanId = traceparent ? traceparent.slice(36, 52) : null; 
    this.operationName = operationName; 
    this.startTime = Date.now(); 
    this.endTime = null; 
    this.tags = {}; 
    this.logs = []; 
  }

  addStartTime() {
    this.startTime = Date.now();
  }

  addEndTime() {
    this.endTime = Date.now();
  }

  addTag(key, value) {
    this.tags[key] = value;
  }

  addLog(message) {
    this.logs.push({
      timestamp: Date.now(),
      message,
    });
  }

  logSpan() {
    console.log(JSON.stringify(this, null, 2));
  }

  getSpanData() {
    return {
      traceId: this.traceId,
      spanId: this.spanId,
      parentSpanId: this.parentSpanId,
      operationName: this.operationName,
      startTime: this.startTime,
      endTime: this.endTime,
      tags: this.tags,
      logs: this.logs,
    };
  }

  getTraceId(){
    return this.traceId;
  }

  getSpanId() {
    return this.spanId;
  }

  getTraceParent() {
    return `00-${this.traceId}-${this.spanId}-01`;
  }

}

module.exports = Span;
