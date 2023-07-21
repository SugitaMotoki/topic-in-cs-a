<template>
  <v-container>
    <v-btn size="large" @click="execute" block class="mb-4">実行</v-btn>
    <v-row>
      <v-col cols="12" md="3">
        <v-btn
          v-for="source in sources"
          :key="source.label"
          @click="assemblyCode = source.source"
          block
          class="mb-2"
        >
          {{ source.label }}
        </v-btn>
      </v-col>
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
      <v-col cols="12" md="3">
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

const sampleCodes = useSampleCodes()

const assemblyCode = ref("");
assemblyCode.value = sampleCodes.benchmark.fibonacci.assembly;

const cInterpreter = new (interpreter().CInterpreter)();

const result = ref("");
const execute = () => {
  try {
    result.value = cInterpreter.executeFromAssembly(assemblyCode.value);
  } catch (error) {
    result.value = error as string;
  }
}

const sources = [
  { label: "fibonacci", source: sampleCodes.benchmark.fibonacci.assembly },
  { label: "math", source: sampleCodes.assembly.variable.local.math },
  { label: "array", source: sampleCodes.assembly.variable.local.array },
]
</script>