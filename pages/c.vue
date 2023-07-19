<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-textarea
          name="c-source-code"
          label="Cのソースコード"
          auto-grow
          variant="solo"
          rows="10"
          v-model="cSourceCode"
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
    <v-btn @click="execute" block>実行</v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { useSampleCodes } from "../composables";
import { interpreter } from "../utils";

const cSourceCode = ref("");
cSourceCode.value = useSampleCodes().c.hello;

const cInterpreter = new (interpreter().CInterpreter)();

const result = ref("");
const execute = () => {
  try {
    result.value = cInterpreter.execute(cSourceCode.value);
  } catch (error) {
    result.value = error as string;
  }
}
</script>