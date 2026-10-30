<template>
  <label :for="field.name" class="block font-medium mb-1">
    {{ field.label }}
    <span v-if="field.required" class="text-red-500">*</span>
  </label>
  <div class="editor-wrapper p-fluid">
    <textarea :id="field.name" ref="textareaRef"></textarea>
  </div>
  <small v-if="errors.has(field.name)" class="text-red-500 block mt-1">
    {{ errors.get(field.name) }}
  </small>
  <Message v-if="resolv_error[field.name]?.invalid" severity="error" size="small" variant="simple">
    {{ resolv_error[field.name]?.error?.message }}
  </Message>
  <Dialog
    v-model:visible="showHtmlDialog"
    maximizable
    modal
    header="Code HTML"
    :style="{ width: '90vw', height: '90vh' }"
    class="hbk-html-editor">
    <div ref="codeMirrorContainer"></div>
    <template #footer>
      <div class="flex justify-end gap-2 pt-3 pe-5">
        <Button label="Formater" severity="secondary" size="small" @click="formatCodeMirrorHtml" />
        <Button label="Annuler" severity="secondary" outlined size="small" @click="showHtmlDialog = false" />
        <Button label="Appliquer" @click="applyHtmlSourceCode" size="small" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Message from 'primevue/message';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import tinymce from 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/models/dom';
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/skins/ui/oxide/content.css';
import 'tinymce/skins/content/default/content.css';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/table';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/image';
import { registerQuickUploader } from '@/hbkthemes/Form/QuickUploader';

import type { Editor } from 'tinymce';
import type { EntityFormFieldInterface } from '@/types';
import { createHtmlCodeMirror, getEditorValue, formatEditorHTML } from '@/hbkthemes/Form/CodeMirror';
import type { EditorView } from 'codemirror';

const props = withDefaults(
  defineProps<{
    field: EntityFormFieldInterface;
    modelValue?: string;
    errors: Map<string, string>;
    resolv_error: any;
    rows?: number;
  }>(),
  {
    rows: 5,
  },
);
const applyHtmlSourceCode = (): void => {
  if (!editorInstance) {
    return;
  }

  const html = codeMirrorView ? getEditorValue(codeMirrorView) : htmlSourceCode.value;

  editorInstance.setContent(html, { format: 'html' });
  editorInstance.save();

  emit('update:modelValue', html);
  showHtmlDialog.value = false;
};
const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const showHtmlDialog = ref(false);
const htmlSourceCode = ref('');
//
const codeMirrorContainer = ref<HTMLDivElement | null>(null);
let codeMirrorView: EditorView | null = null;
//
let editorInstance: Editor | null = null;
let internalUpdate = false;
const formatCodeMirrorHtml = (): void => {
  if (!codeMirrorView) {
    return;
  }

  formatEditorHTML(codeMirrorView);
  htmlSourceCode.value = getEditorValue(codeMirrorView);
};

const openHtmlCodeDialog = async (): Promise<void> => {
  if (!editorInstance) {
    return;
  }

  htmlSourceCode.value = editorInstance.getContent({ format: 'html' });
  showHtmlDialog.value = true;

  await nextTick();

  if (!codeMirrorContainer.value) {
    return;
  }

  codeMirrorView?.destroy();

  codeMirrorView = createHtmlCodeMirror({
    parent: codeMirrorContainer.value,
    value: htmlSourceCode.value,
    theme: 'dark',
    height: '100%',
    onChange: (value) => {
      htmlSourceCode.value = value;
    },
  });

  await formatEditorHTML(codeMirrorView);
  htmlSourceCode.value = getEditorValue(codeMirrorView);
};
onMounted(async () => {
  await nextTick();
  if (!textareaRef.value) {
    return;
  }
  await tinymce.init({
    target: textareaRef.value,
    license_key: 'gpl',
    height: 400,
    menubar: false,
    branding: false,
    promotion: false,
    plugins: [
      'lists',
      'link',
      'image',
      'table',
      'emoticons',
      'charmap',
      'visualblocks',
      'wordcount',
      'searchreplace',
      'image',
    ],
    toolbar:
      'undo redo | image blocks  fontsize openHtmlCode quickUploader | ' +
      'bold italic underline strikethrough | forecolor backcolor ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist | link image table emoticons charmap | ' +
      'visualblocks searchreplace | fontfamily',
    block_formats: 'Paragraphe=p; Titre 2=h2; Titre 3=h3; Titre 4=h4; Citation=blockquote; Préformaté=pre',
    font_size_formats: '12px 13px 14px 16px 18px 20px 24px 30px 36px 48px',
    table_toolbar:
      'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | ' +
      'tableinsertcolbefore tableinsertcolafter tabledeletecol',
    link_default_target: '_blank',
    image_title: true,
    automatic_uploads: false,
    valid_elements: '*[*]',
    extended_valid_elements: 'span[*]',
    verify_html: false,
    skin: false,
    content_css: false,
    entity_encoding: 'raw',
    setup(editor: Editor) {
      editorInstance = editor;
      editor.on('init', () => {
        editor.setContent(props.modelValue || '');
      });
      editor.on('change keyup input undo redo setcontent', () => {
        internalUpdate = true;
        emit('update:modelValue', editor.getContent());
        internalUpdate = false;
      });
      editor.ui.registry.addButton('openHtmlCode', {
        text: 'Code HTML',
        tooltip: 'Modifier le code HTML',
        onAction: openHtmlCodeDialog,
      });
      registerQuickUploader(editor, {
        uploadUrl: '/api/file/upload',
        baseUrl: '',
        acceptedFiles: 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip',
      });
    },
  });
});

watch(
  () => props.modelValue,
  (value) => {
    if (!editorInstance || internalUpdate) {
      return;
    }

    if ((value || '') !== editorInstance.getContent()) {
      editorInstance.setContent(value || '');
    }
  },
);

onBeforeUnmount(() => {
  editorInstance?.remove();
  editorInstance = null;
  //
  codeMirrorView?.destroy();
  codeMirrorView = null;
});
</script>

<style lang="scss">
.editor-wrapper {
  .tox-editor-container {
    .tox-editor-header {
      .tox-tbtn[data-mce-name='fontsize'] {
        width: 70px !important;
      }
      .tox-tbtn[data-mce-name='blocks'] {
        width: 100px !important;
      }
    }
  }
}
.hbk-html-editor {
  &.p-dialog {
    max-width: 100% !important;
    .p-dialog-content {
      padding: 0;
    }
  }
  .codemirror-wrapper {
    .cm-editor {
      font-size: 13px;
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
    }
    .cm-panels-bottom {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      top: auto;
    }
  }
  //
  .codemirror-wrapper {
    border: 1px solid var(--p-content-border-color);
    border-radius: 6px;
    overflow: hidden;
    background: #1e1e1e;
  }

  .codemirror-toolbar {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    padding: 0.75rem;

    border-bottom: 1px solid #374151;

    background: #111827;
  }

  .codemirror-toolbar .btn {
    border: 0;
    border-radius: 4px;

    padding: 0.4rem 0.8rem;

    cursor: pointer;

    background: #374151;
    color: white;

    transition: background 0.2s ease;

    &:hover {
      background: #4b5563;
    }
  }

  .codemirror-status {
    margin-left: auto;
    color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 15px;
  }

  .codemirror-wrapper .cm-editor {
    height: var(--codemirror-height, 500px);
  }

  .codemirror-wrapper .cm-scroller {
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  }

  .codemirror-wrapper.fullscreen {
    position: fixed;
    inset: 20px;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 100000;
    background: #111827;
    border-radius: 8px;
  }

  .codemirror-wrapper.fullscreen .cm-editor {
    height: calc(100vh - 80px);
  }
}
</style>
