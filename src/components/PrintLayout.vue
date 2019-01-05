<template lang="pug">
  v-dialog( v-model="visible" )
    v-card( class="page" )
      v-card-text( style="padding: 5mm" id="print-out" )
        div( class="date" )
          table( class="w-100" )
            tr
              td( class="font-8" )
                |{{ invoice }}
              td( class="font-8 text-right" )
                |{{ date }}
        h1( class="header" )
          |ANEKA RASA
        p( class="address" )
          |Blangpidie
        table
          tr( v-for="item in items" :key="item.id" v-if="item.quantity > 0" )
            td
              div( class="item" )
                |{{ item.quantity }} {{ item.product ? item.product : item.name }}
              div( class="item" )
                |{{ toCurrency(item.quantity * item.price) }}
        table
          tbody
            tr
              td( colspan="3" class="text-right bold" )
                |Total
              td( class="text-right bold" )
                |{{ total }}
            tr
              td( colspan="3" class="text-right" )
                |Bayar
              td( class="text-right" )
                |{{ toCurrency(cash) }}
            tr
              td( colspan="3" class="text-right" )
                |Kembalian
              td( class="text-right" )
                |{{ countTotal }}
        div( class="signature-title" )
          |Melayani:
          br
          |catering &amp; nasi kotak
        div( class="signature-title" )
          |081375490252
          br
          |##TERIMA KASIH##
</template>

<script>
import { toCurrency } from '@/libs/currency'
export default {
  props: ['items', 'cash', 'total', 'invoice'],
  data () {
    return {
      visible: false
    }
  },

  computed: {
    date () {
      let date = new Date()
      return date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
    },

    countTotal () {
      let total = Number(String(this.total).replace('Rp. ', '').replace(',', ''))
      return toCurrency(this.cash - total)
    }
  },

  methods: {
    toCurrency (v) {
      return toCurrency(v)
    }
  }
}
</script>
