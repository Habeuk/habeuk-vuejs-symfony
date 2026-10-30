<template>
  <div class="form--file-upload">
    <label :for="field.name" class="block font-medium mb-1">
      {{ field.label }}
      <span v-if="field.required" class="text-red-500">*</span>
    </label>
    <FileUpload
      :id="field.name"
      :name="field.name"
      :multiple="multiple"
      accept="image/*"
      :maxFileSize="1000000"
      :fileLimit="cardinality"
      severity="secondary"
      :required="field.required"
      @select="onSelectedFiles">
      <template #header="{ chooseCallback }">
        <div v-show="filesToUpload.length == 0 && !multiple" class="flex flex-col w-full mt-2">
          <div class="flex gap-2 flex justify-center mb-3">
            <Button @click="chooseCallback()" severity="info">
              <Images class="w-4 h-4 me-2" />
              Selectionner une image
            </Button>
          </div>
        </div>
      </template>
      <template #content="{ removeFileCallback }">
        <div class="flex flex-col gap-8 pt-4 content-images">
          <div v-if="filesToUpload.length > 0">
            <div class="flex flex-wrap gap-4 relative item-preview">
              <div
                v-for="(fileToUpload, index) of filesToUpload"
                :key="index"
                class="p-2 rounded-border flex flex-col border border-surface items-center gap-1 relative">
                <div>
                  <img
                    role="presentation"
                    :alt="fileToUpload.file?.name"
                    :src="fileToUpload.objectURL"
                    width="100"
                    height="50"
                    class="p-image-preview object-contain" />
                </div>
                <span
                  class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden"
                  :title="fileToUpload.name">
                  {{ fileToUpload.name }}
                </span>

                <small>{{ formatSize(fileToUpload.size ?? 0) }}</small>

                <div class="flex justify-between items-end w-full">
                  <Check
                    v-if="fileToUpload.status === 'done'"
                    class="icon-status w-4 h-4"
                    :class="statusSeverity(fileToUpload)"
                    :title="statusTextUpload(fileToUpload)" />
                  <X
                    v-else-if="fileToUpload.status === 'error'"
                    class="icon-status w-4 h-4"
                    :class="statusSeverity(fileToUpload)"
                    :title="statusTextUpload(fileToUpload)" />
                  <LoaderCircle
                    v-else
                    class="icon-status w-4 h-4 animate-spin"
                    :class="statusSeverity(fileToUpload)"
                    :title="statusTextUpload(fileToUpload)" />
                  <Button
                    @click="onRemoveTemplatingFile(fileToUpload, removeFileCallback, index)"
                    variant="outlined"
                    rounded
                    severity="danger"
                    class="remove-file border-0">
                    <template #icon><Trash2 class="w-4 h-4" /></template>
                  </Button>
                </div>
                <ProgressBar
                  :key="field.name + '-' + index"
                  :value="fileToUpload.uploadProgress"
                  :pt="{
                    value: { class: 'bg-black' },
                  }"
                  class="h-2 bg-success-500"></ProgressBar>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="filesToUpload.length === 0" #empty>
        <div class="flex items-center justify-center flex-col">
          <CloudUpload class="w-12 h-12" />
          <p class="mt-6 mb-0 font-bold">{{ field.placeholder }}</p>
        </div>
      </template>
    </FileUpload>
    <small v-if="errors.has(field.name)" class="text-red-500 block mt-1">
      {{ errors.get(field.name) }}
    </small>
    <Message v-if="resolv_error[field.name]?.invalid" severity="error" size="small" variant="simple">
      {{ resolv_error[field.name]?.error?.message }}
    </Message>
  </div>
</template>

<script setup lang="ts">
import { Images, Trash2, CloudUpload, Check, X, LoaderCircle } from '@lucide/vue';
import { ref, watch, onMounted } from 'vue';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';
import rootAxios from '@/configs/rootAxios';
import type { EntityFormFieldInterface } from '@/types';

interface UploadFile {
  file?: File;
  objectURL?: string;
  status?: 'wait' | 'run' | 'done' | 'error';
  url_serveur?: string;
  fid?: number;
  uploadProgress?: number;
  name?: string;
  size?: number;
}
const props = defineProps<{
  field: EntityFormFieldInterface;
  modelValue: any;
  errors: Map<string, string>;
  resolv_error: any;
}>();
const selectedValue = ref(props.modelValue);

const filesToUpload = ref<UploadFile[]>([]);
const multiple = ref<boolean>(props.field.cardinality === -1 || props.field.cardinality > 1);
const cardinality = ref<number | undefined>(props.field.cardinality === -1 ? undefined : props.field.cardinality);

const onRemoveTemplatingFile = (uplFile: UploadFile, removeFileCallback: (index: number) => void, index: number) => {
  const removeInDisplay = () => {
    removeFileCallback(index);
    // remove file from filesToUpload
    filesToUpload.value.splice(index, 1);
  };
  // remove file from serveur.
  uplFile.status = 'run';
  if (uplFile.fid === null || uplFile.fid === undefined) {
    removeInDisplay();
    return;
  }
  rootAxios
    .delete('/api/file/delete/' + uplFile.fid)
    .then(() => {
      removeInDisplay();
    })
    .catch(() => {
      uplFile.status = 'error';
    });
};

const onSelectedFiles = (event: { files: File[] }): void => {
  if (!multiple.value) {
    filesToUpload.value = [];
  }
  event.files.forEach((file: File) => {
    filesToUpload.value.push({
      file: file,
      status: 'wait',
      objectURL: (file as any).objectURL,
      uploadProgress: 0,
      name: file.name,
      size: file.size,
    });
  });
  uploadFiles();
};

const uploadFiles = (): void => {
  const url = '/api/file/upload';
  const uploadFile = (index: any) => {
    const nextIndex = index + 1;
    const fileToUpload = filesToUpload.value[index];
    if (multiple.value && !selectedValue.value.isArray()) {
      selectedValue.value = [];
    }
    if (fileToUpload && fileToUpload.status === 'wait') {
      fileToUpload.status = 'run';
      if (fileToUpload.file)
        rootAxios
          .postFile(url, fileToUpload.file, (percent) => {
            fileToUpload.uploadProgress = percent;
          })
          .then((response) => {
            if (response.data) {
              fileToUpload.status = 'done';
              fileToUpload.url_serveur = response.data.url;
              fileToUpload.fid = response.data.fid;
              fileToUpload.name = response.data.name;
              if (!multiple.value) {
                selectedValue.value = fileToUpload.fid;
              }
            } else {
              fileToUpload.status = 'error';
            }
            uploadFile(nextIndex);
          })
          .catch((_error) => {
            fileToUpload.status = 'error';
            uploadFile(nextIndex);
          });
      else {
        uploadFile(nextIndex);
      }
    }
  };
  uploadFile(0);
};

const formatSize = (bytes: number): string => {
  const k = 1024;
  const dm = 3;
  const sizes = ['o', 'Ko', 'Mo', 'Go', 'To'];
  if (bytes === 0) {
    return `0 ${sizes[0]}`;
  }
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${formattedSize} ${sizes[i]}`;
};
const statusTextUpload = (file: UploadFile) => {
  if (file.status === 'done') {
    return 'Uploadé';
  } else if (file.status === 'error') {
    return 'Erreur';
  } else {
    return 'En attente';
  }
};
const statusSeverity = (file: UploadFile) => {
  if (file.status === 'done') {
    return 'success';
  } else if (file.status === 'error') {
    return 'danger';
  } else {
    return 'warning';
  }
};
const emit = defineEmits(['update:modelValue']);
watch(selectedValue, (newValue) => {
  emit('update:modelValue', { id: newValue });
});

/**
 * Recupere la valeur par defaut pour un champ et propose les options.
 */
const loadDefaultDatas = () => {
  const value = props.modelValue;
  if (value !== undefined && value.id) {
    filesToUpload.value = [];
    rootAxios.get('/api/file/load/' + value.id).then((res) => {
      if (res.data) {
        filesToUpload.value.push({
          name: res.data.name,
          size: res.data.size,
          status: 'done',
          objectURL: res.data.url_default,
          fid: res.data.fid,
        });
      }
    });
  }
};
onMounted(() => {
  loadDefaultDatas();
});
</script>
<style lang="scss">
.form--file-upload {
  .p-fileupload-advanced {
    border: none;
  }
  .p-fileupload-header {
    padding-inline: 0;
  }
  .p-fileupload-content {
    border: 1px dashed #ccc;
    .p-image-preview {
      width: 150px;
      height: 100px;
      object-fit: contain;
      border-radius: 5px 5px 0 0;
    }
    .p-progressbar {
      position: absolute;
      left: 0px;
      top: auto;
      right: 0px;
      bottom: -5px;
      max-width: calc(100%);
      background-color: var(--p-gray-300);
    }
    .p-progressbar-value {
      max-width: 100%;
    }
  }
  .p-fileupload {
    padding: 0rem 2rem 2rem;
  }
  .item-preview {
    .remove-file {
      position: absolute;
      top: -8px;
      right: -8px;
      left: auto;
      bottom: auto;
      opacity: 0.7;
      &:hover {
        opacity: 1;
      }
    }
    .icon-status {
      position: absolute;
      bottom: -6px;
      z-index: 99;
      left: auto;
      right: 0;
      &.success {
        color: var(--p-success-500);
      }
      &.danger {
        color: var(--p-danger-500);
      }
      &.warning {
        color: var(--p-warning-500);
      }
    }
  }
}
</style>
