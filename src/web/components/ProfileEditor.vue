<template>
  <div class="pe__overlay" @click.self="$emit('close')">
    <div class="pe">
      <h3 class="pe__title">Edit profile</h3>

      <label class="pe__lab">Display name</label>
      <input class="pe__in" v-model="name" maxlength="40" placeholder="Your name (optional)" />

      <label class="pe__lab">Bio</label>
      <textarea class="pe__in" v-model="bio" rows="3" maxlength="240" placeholder="A short bio (optional)"></textarea>

      <label class="pe__lab">Profile photo</label>
      <div v-if="!imageSrc" class="pe__pick">
        <button class="pe__btn" @click="fileInput?.click()">Choose photo</button>
        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" style="display:none" @change="onPick" />
      </div>
      <div v-else class="pe__crop">
        <Cropper
          :src="imageSrc"
          :stencil-component="CircleStencil"
          :stencil-props="{ aspectRatio: 1 }"
          @change="onCropChange"
          class="pe__cropper"
        />
        <button class="pe__btn pe__btn--ghost" @click="clearImage">Choose a different photo</button>
      </div>

      <p v-if="error" class="pe__err">{{ error }}</p>

      <div class="pe__actions">
        <button class="pe__btn pe__btn--ghost" @click="$emit('close')" :disabled="saving">Cancel</button>
        <button class="pe__btn pe__btn--gold" @click="save" :disabled="saving">{{ saving ? "Saving…" : "Save" }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Cropper, CircleStencil } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import { useCommonsStore } from "@/stores/commons";

const commons = useCommonsStore();
const emit = defineEmits<{ (e: "close"): void; (e: "saved"): void }>();
const props = defineProps<{ accountId: string }>();

const name = ref(commons.getDisplayName(props.accountId));
const bio = ref(commons.getBio(props.accountId));
const imageSrc = ref<string>("");
const fileInput = ref<HTMLInputElement | null>(null);
const saving = ref(false);
const error = ref("");
let cropCanvas: HTMLCanvasElement | null = null;

function onPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  error.value = "";
  const okTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!okTypes.includes(file.type)) { error.value = "Use a JPG, PNG, or WebP image."; return; }
  if (file.size > 5 * 1024 * 1024) { error.value = "Image must be under 5 MB."; return; }
  imageSrc.value = URL.createObjectURL(file);
}
function clearImage() { imageSrc.value = ""; cropCanvas = null; }
function onCropChange({ canvas }: { canvas: HTMLCanvasElement }) { cropCanvas = canvas; }

async function save() {
  saving.value = true;
  error.value = "";
  // 1) name + bio
  const p = await commons.updateProfile(name.value, bio.value);
  if (!p.ok) { error.value = p.error || "Could not save profile."; saving.value = false; return; }
  // 2) avatar, if a new one was cropped
  if (cropCanvas) {
    const blob: Blob | null = await new Promise((res) => cropCanvas!.toBlob((b) => res(b), "image/jpeg", 0.9));
    if (blob) {
      const up = await commons.uploadAvatar(blob);
      if (!up.ok) { error.value = up.error || "Photo saved partially — try again."; saving.value = false; return; }
    }
  }
  saving.value = false;
  emit("saved");
  emit("close");
}
</script>

<style scoped>
.pe__overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: grid; place-items: center; z-index: 2000; padding: 20px; }
.pe { background: var(--navy-850); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 22px; width: 100%; max-width: 420px; max-height: 90vh; overflow-y: auto; }
.pe__title { margin: 0 0 14px; }
.pe__lab { display: block; font-size: .78rem; color: var(--ink-dim); margin: 12px 0 4px; }
.pe__in { width: 100%; background: var(--navy-900); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 9px 11px; color: var(--ink); font-family: inherit; font-size: .9rem; }
.pe__crop { display: flex; flex-direction: column; gap: 8px; }
.pe__cropper { max-height: 300px; background: var(--navy-900); border-radius: var(--r-sm); }
.pe__err { color: var(--negate); font-size: .82rem; margin: 10px 0 0; }
.pe__actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }
.pe__btn { padding: 8px 16px; border-radius: var(--r-sm); border: 1px solid var(--line); background: var(--navy-900); color: var(--ink); font-size: .85rem; cursor: pointer; }
.pe__btn--ghost { background: none; }
.pe__btn--gold { background: var(--gold-500, #C9A84C); color: #22180a; border-color: transparent; font-weight: 700; }
.pe__btn:disabled { opacity: .5; cursor: default; }
</style>