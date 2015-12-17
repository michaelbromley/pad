import {Pipe} from 'angular2/core'
//import marked from 'marked';
let marked = require('marked');

@Pipe({
  name: 'markdown'
})
class MarkdownPipe {
  transform(value: string) : any {
    return marked(value || '')
  }
}

export default MarkdownPipe;