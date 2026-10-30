import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import FileUpload from 'primevue/fileupload';
import FilesUpload from '@/hbkthemes/views/Entity/fields/FilesUpload.vue';
import { makeField } from '@/tests/fixtures/formFields';

/**
 * Champ fichier : l'état de chaque fichier (en attente / uploadé / en erreur) doit être
 * visible et le formulaire ne doit recevoir que l'identifiant du fichier enregistré.
 * Le transport HTTP est simulé (postFile / delete).
 */
const { rootAxiosMock } = vi.hoisted(() => ({
  rootAxiosMock: { get: vi.fn(), post: vi.fn(), postFile: vi.fn(), delete: vi.fn() },
}));

vi.mock('@/configs/rootAxios', () => ({ default: rootAxiosMock }));

const mountFilesUpload = () => {
  const field = makeField({
    name: 'documents',
    type: 'file_upload',
    label: 'Documents',
    placeholder: 'Déposez vos images',
    cardinality: 1,
  });

  return mount(FilesUpload, {
    props: {
      field,
      modelValue: { id: null },
      errors: new Map<string, string>(),
      resolv_error: {},
    },
  });
};

/** Simule la sélection d'un fichier par l'utilisateur (événement émis par PrimeVue FileUpload). */
const selectFile = (wrapper: ReturnType<typeof mountFilesUpload>, name = 'photo.png', size = 2048) => {
  const file = new File([new Uint8Array(size)], name, { type: 'image/png' });
  wrapper.findComponent(FileUpload).vm.$emit('select', { files: [file] });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FilesUpload — état vide', () => {
  it('affiche la zone de dépôt et le texte d’aide', async () => {
    const wrapper = mountFilesUpload();
    await flushPromises();

    expect(wrapper.text()).toContain('Documents');
    expect(wrapper.text()).toContain('Déposez vos images');
    expect(wrapper.find('.lucide-cloud-upload').exists()).toBe(true);
  });
});

describe('FilesUpload — état des fichiers', () => {
  it('affiche le fichier uploadé avec son icône de succès et sa taille', async () => {
    rootAxiosMock.postFile.mockResolvedValue({ data: { url: '/uploads/photo.png', fid: 12, name: 'photo.png' } });
    const wrapper = mountFilesUpload();
    await flushPromises();

    selectFile(wrapper);
    await flushPromises();

    expect(rootAxiosMock.postFile).toHaveBeenCalledOnce();
    expect(wrapper.find('.lucide-check').exists()).toBe(true);
    expect(wrapper.find('.icon-status').attributes('title')).toBe('Uploadé');
    expect(wrapper.text()).toContain('photo.png');
    expect(wrapper.text()).toContain('2 Ko');
  });

  it('transmet l’identifiant du fichier au formulaire', async () => {
    rootAxiosMock.postFile.mockResolvedValue({ data: { url: '/uploads/photo.png', fid: 12, name: 'photo.png' } });
    const wrapper = mountFilesUpload();
    await flushPromises();

    selectFile(wrapper);
    await flushPromises();

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual({ id: 12 });
  });

  it('affiche l’icône d’erreur quand l’upload échoue', async () => {
    rootAxiosMock.postFile.mockRejectedValue(new Error('upload indisponible'));
    const wrapper = mountFilesUpload();
    await flushPromises();

    selectFile(wrapper);
    await flushPromises();

    expect(wrapper.find('.lucide-x').exists()).toBe(true);
    expect(wrapper.find('.icon-status').attributes('title')).toBe('Erreur');
  });

  it('affiche l’icône d’attente pendant l’upload', async () => {
    rootAxiosMock.postFile.mockReturnValue(new Promise(() => {}));
    const wrapper = mountFilesUpload();
    await flushPromises();

    selectFile(wrapper);
    await flushPromises();

    expect(wrapper.find('.lucide-loader-circle').exists()).toBe(true);
    expect(wrapper.find('.icon-status').attributes('title')).toBe('En attente');
  });
});
