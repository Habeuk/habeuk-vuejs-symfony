import type { Editor } from 'tinymce';
import appConfig from '@/configs/appConfig';

export interface QuickUploaderOptions {
  uploadUrl: string;
  baseUrl?: string;
  acceptedFiles?: string;
}

const uploadFile = async (file: File, options: QuickUploaderOptions): Promise<string> => {
  const formData = new FormData();
  formData.append('upload', file);
  const token = localStorage.getItem(appConfig.token_name);
  const response = await fetch(options.uploadUrl, {
    method: 'POST',
    headers: (token ? { Authorization: `Bearer ${token}` } : {}),
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }
  const json: {
    url_default?: string;
    url?: string;
  } = await response.json();
  const url = json.url ?? json.url_default;
  if (!url) {
    throw new Error('Réponse upload invalide : URL manquante');
  }
  return `${options.baseUrl ?? ''}${url}`;
};

const insertFile = (editor: Editor, file: File, url: string): void => {
  const safeName = file.name.replace(/[<>"']/g, '');

  if (file.type.startsWith('image/')) {
    editor.insertContent(`
            <img
                src="${url}"
                alt="${safeName}"
                class="img-fluid"
            />
        `);

    return;
  }

  editor.insertContent(`
        <a
            href="${url}"
            target="_blank"
            rel="noopener noreferrer"
        >
            ${safeName}
        </a>
    `);
};

export const registerQuickUploader = (editor: Editor, options: QuickUploaderOptions): void => {
  editor.ui.registry.addButton('quickUploader', {
    icon: 'upload',
    tooltip: 'Importer un fichier',

    onAction: () => {
      const input = document.createElement('input');

      input.type = 'file';
      input.multiple = true;

      if (options.acceptedFiles) {
        input.accept = options.acceptedFiles;
      }

      input.addEventListener('change', async () => {
        const files = Array.from(input.files || []);

        for (const file of files) {
          try {
            const url = await uploadFile(file, options);

            insertFile(editor, file, url);
          } catch (error) {
            console.error(error);
          }
        }
      });

      input.click();
    },
  });
};
