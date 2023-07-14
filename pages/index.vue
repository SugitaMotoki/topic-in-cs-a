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
      :model-value="cSourceCode"
    />
    <v-textarea
      name="assembly-code"
      label="アセンブリコード"
      auto-grow
      variant="solo"
      :model-value="assemblyCode"
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
const cSourceCode = ref("");
cSourceCode.value = sampleCodes().c.tiny;

const assemblyCode = ref("");
assemblyCode.value = sampleCodes().assembly.tiny;

const cInterpreter = new (interpreter().CInterpreter)();

const result = ref("");
const execute = () => {
  result.value = cInterpreter.executeFromAssembly(assemblyCode.value);
}
execute();
</script>