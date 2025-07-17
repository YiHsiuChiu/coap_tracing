const crypto = require('crypto');

function generateId(size) {
  return crypto.randomBytes(size).toString('hex');
}

class ISpan {
  constructor(operationName, traceId = null, parentId = null) {
    this.traceId = traceId ? traceId : generateId(4); 
    this.spanId = generateId(8); 
    this.parentSpanId = parentId ? parentId : null; 
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

}

module.exports = ISpan;
