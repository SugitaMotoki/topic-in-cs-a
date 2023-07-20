<template>
  <v-container>
    <v-btn size="large" @click="execute" block class="mb-4">実行</v-btn>
    <v-row>
      <v-col cols="12" md="6">
        <v-textarea
          name="assembly-code"
          label="アセンブリコード"
          auto-grow
          variant="solo"
          rows="10"
          v-model="assemblyCode"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-textarea
          name="result"
          label="実行結果"
          auto-grow
          variant="solo"
          rows="10"
          readonly
          v-model="result"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useSampleCodes } from "../composables";
import { interpreter } from "../utils";

const assemblyCode = ref("");
assemblyCode.value = useSampleCodes().benchmark.fibonacci.assembly;
assemblyCode.value = useSampleCodes().assembly.variable.local.array;

const cInterpreter = new (interpreter().CInterpreter)();

const result = ref("");
const execute = () => {
  try {
    result.value = cInterpreter.executeFromAssembly(assemblyCode.value);
  } catch (error) {
    result.value = error as string;
  }
}
</script>