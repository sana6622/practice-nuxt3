import { defineNuxtPlugin } from '#app'
import * as tf from '@tensorflow/tfjs'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      tf
    }
  }
})
