<template>
  <v-container>
    <div>
      <h1>情報科学特別講義</h1>
    </div>
    <v-btn @click="execute">実行</v-btn>
    <v-textarea
      name="c-source-code"
      label="Cのソースコード"
      auto-grow
      variant="solo"
      :model-value="cSample"
    />
    <v-textarea
      name="result"
      label="実行結果"
      auto-grow
      variant="solo"
      :model-value="result"
    />
  </v-container>
</template>

<script setup lang="ts">
const cSample = ref("");
cSample.value = sampleCodes().c.hello;

// HACK: 仮の命令列
const instructions = [
  { id: 2, argments: [9] },
  { id: 2, argments: [2] },
  { id: 1, argments: [] },
  { id: 0, argments: [] },
];
cSample.value = JSON.stringify(instructions);

const cInterpreter = new (interpreter().CInterpreter)();
const result = ref("");
const execute = () => {
  result.value = cInterpreter.execute(cSample.value);
}
execute();
</script>