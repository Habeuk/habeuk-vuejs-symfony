import {
  ClassicEditor,
  Essentials,
  Bold,
  Italic,
  Font,
  Paragraph,
  Underline,
  Strikethrough,
  BlockQuote,
  Heading,
  Link,
  List,
  Alignment,
  Highlight,
  Code,
  CodeBlock,
  Image,
  ImageToolbar,
  ImageUpload,
  Table,
  TableToolbar,
  MediaEmbed,
  HorizontalLine,
  SourceEditing,
  GeneralHtmlSupport,
  SimpleUploadAdapter,
  Fullscreen,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

class ckeditorBuilder {
  private textarea: HTMLTextAreaElement;
  constructor(textareaHtml: HTMLTextAreaElement) {
    this.textarea = textareaHtml;
  }

  /**
   * Return 'editeur' instance of CKEditor5.
   * @returns
   */
  init(): Promise<ClassicEditor> {
    const textarea = this.textarea;
    return ClassicEditor.create(textarea, {
      licenseKey: 'GPL',
      plugins: [
        Essentials,
        Paragraph,
        Bold,
        Italic,
        Underline,
        Strikethrough,
        BlockQuote,
        Heading,
        Link,
        List,
        Alignment,
        Font,
        Highlight,
        Code,
        CodeBlock,
        Image,
        ImageToolbar,
        ImageUpload,
        Table,
        TableToolbar,
        MediaEmbed,
        HorizontalLine,
        SourceEditing,
        GeneralHtmlSupport,
        SimpleUploadAdapter,
        Fullscreen,
      ],
      toolbar: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'highlight',
        '|',
        'fontSize',
        'fontFamily',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'link',
        'blockquote',
        'code',
        'codeBlock',
        'Fullscreen',
        'sourceEditing',
        '|',
        'bulletedList',
        'numberedList',
        'alignment',
        '|',
        'insertTable',
        'imageUpload',
        'mediaEmbed',
        'horizontalLine',
      ],
      htmlSupport: {
        allow: [
          // 1. On force la conservation stricte des spans avec leurs classes
          {
            name: 'span',
            attributes: true,
            classes: true,
            styles: true,
          },
          // 2. Votre règle globale pour le reste des tags
          {
            name: /.*/,
            attributes: true,
            classes: true,
            styles: true,
          },
        ],
        disallow: [
          // { name: "style" }, // ❌ interdit <style>
          // { name: "script" }, // ❌ interdit <script>
          // { name: "h1" }, // ❌ interdit <h1>
        ],
      },
      image: {
        toolbar: ['imageTextAlternative', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side'],
      },
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
      },
      simpleUpload: {
        uploadUrl: '/api/image/upload',
      },
      language: 'fr',
    })
      .then((editor) => {
        // Intercepte le rendu (downcast) des éléments GHS pour bloquer la fusion des spans
        editor.conversion.for('downcast').add((dispatcher) => {
          dispatcher.on('attribute:htmlSpan', (_evt, data, conversionApi) => {
            // Si l'élément possède une plage de vue valide, on lui injecte un attribut invisible aléatoire
            if (data.viewRange) {
              conversionApi.writer.setAttribute('data-ck-managed', Math.floor(Math.random() * 1000000), data.viewRange);
            }
          });
        });
        return editor;
      })
      .catch((error) => {
        console.error('Erreur CKEditor:', error);
        throw error;
      });
  }
}
export default ckeditorBuilder;
