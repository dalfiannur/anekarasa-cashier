<template lang="pug">
  v-app( id="app" )
    v-toolbar( app class="primary" )
      v-btn( color="green" @click="onSave" )
        |Simpan
    v-content( app )
      v-container( fluid )
        v-layout( row wrap )
          v-flex( md5 )
            v-layout( row wrap )
              v-flex( md8 )
                label
                  |Nama Pesanan
                v-autocomplete( solo :items="products" item-text="name" return-object @change="$refs.qty.focus();$refs.qty.reset()" v-model="product" ref="product" )
              v-flex( md3 offset-md1 )
                label
                  |Banyak Pesanan
                v-text-field( solo ref="qty" v-model="product.quantity" @keyup.enter="addProduct" )
          v-flex( md6 offset-md1 )
            v-layout( row wrap )
              v-flex( md3 )
                label
                  |Nomor Pesanan
                v-text-field( solo readonly v-model="invoiceNumber" )
              v-flex( md4 offset-md1 )
                label
                  |Total Tagihan
                v-text-field( solo readonly prefix="Rp" v-model="totalTagihan" )
              v-flex( md2 offset-md1 )
                label
                  |Diskon
                v-text-field( solo suffix="%" mask="###" @keyup="countTotalTagihan" v-model="diskon" )
            v-layout( row wrap )
              v-flex( md12 )
                v-data-table( :headers="tableReservation.headers" :items="tableReservation.items" )
                  template( slot="items" slot-scope="props" )
                    td
                      |{{ props.item.name }}
                    td( class="text-xs-right" )
                      |{{ props.item.price }}
                    td( class="text-xs-right" )
                      v-edit-dialog( :return-value.sync="props.item.quantity" lazy persistent @save="countTotalTagihan" )
                        |{{ props.item.quantity }}
                        v-text-field( slot="input" label="Banyak" v-model="props.item.quantity" single-line counter autofocus )
                    td( class="text-xs-right" )
                      v-btn( icon )
                        v-icon
                          |delete
                  template( slot="pageText" slot-scope="{ pageStart, pageStop }" )
                    |Dari {{ pageStart }} sampai {{ pageStop }}
</template>

<script>
import axios from 'axios'
const url = process.env.API

export default {
  data () {
    return {
      diskon: 0,
      product: {
        quantity: 0
      },
      products: [],
      invoiceNumber: '',
      tableReservation: {
        headers: [
          {
            text: 'Nama Pesanan',
            align: 'center',
            sortable: true,
            value: 'name'
          },
          {
            text: 'Harga',
            align: 'center',
            sortable: true,
            value: 'price'
          },
          {
            text: 'Banyak',
            align: 'center',
            sortable: true,
            value: 'quantity'
          },
          {
            text: '',
            value: ''
          }
        ],
        items: []
      },
      totalTagihan: 0
    }
  },

  created () {
    this.loadProducts()
  },

  mounted () {
    this.getInvoiceNumber()
  },

  methods: {
    onSave () {
      const data = {
        number: this.invoiceNumber,
        diskon: this.diskon,
        items: this.tableReservation.items
      }

      axios.post(url + '/cashier/report', data).then(response => {
        if (response.status === 200) this.$router.push('/')
      })
    },

    getInvoiceNumber () {
      axios.get(url + '/cashier/invoice').then(response => {
        this.invoiceNumber = response.data
      })
    },

    loadProducts () {
      axios.get(url + '/cashier/product').then(response => {
        this.products = response.data
      })
    },

    addProduct () {
      if (this.product.quantity > 0) {
        this.tableReservation.items.push(this.product)
        this.countTotalTagihan()
      }
    },

    countTotalTagihan () {
      let total = 0
      this.tableReservation.items.forEach(item => {
        total += item.quantity * item.price
      })

      if (this.diskon > 0) {
        total = total - ((this.diskon / 100) * total)
      }

      this.totalTagihan = total
    }
  }
}
</script>
