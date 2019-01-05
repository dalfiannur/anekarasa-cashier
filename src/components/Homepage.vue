<template lang="pug">
  v-app( id="app" )
    v-toolbar( app class="primary" )
      v-btn( color="green" @click.native="$router.push('/add-reservation')" )
        |Pesanan Baru
    v-content( app )
      v-container( fluid )
        v-layout( row wrap )
          v-flex( md4 )
            label
              |Filter
            v-select( :items="filterItems" v-model="filter" solo item-text="text" item-value="value" )
            v-data-table( :headers="orderTable.headers" :items="filteredItems" )
              template( slot="items" slot-scope="props" )
                td
                  |{{ props.item.number }}
                td( class="text-xs-right" )
                  |{{ props.item.table_id }}
                td( class="text-xs-right" )
                  v-btn( icon @click="onDetail(props.item.number)" )
                    v-icon
                      |edit
              template( slot="pageText" slot-scope="{ pageStart, pageStop }" )
                |Dari {{ pageStart }} sampai {{ pageStop }}
          v-flex( md7 offset-md1 v-if="showDetail == true")
            v-layout( row wrap )
              v-flex( md3 )
                label
                  |Total Tagihan
                v-text-field( solo prefix="Rp" v-model="totalTagihan" readonly )
              v-flex( md2 offset-md1 )
                label
                  |Diskon
                v-text-field( solo suffix="%" v-model="diskon" @keyup.enter="countTotalTagihan();countCashBack()" )
              v-flex( md3 offset-md1 )
                label
                  |Kembalian
                v-text-field( solo prefix="Rp" readonly v-model="cashback" )
            v-layout( row wrap )
              v-flex( md5 )
                label
                  |Pembayaran
                v-text-field( solo prefix="Rp" v-model="cash" @keyup="countCashBack" ref="cash" )
              v-flex( md6 offset-md1 style="padding-top: 22px" v-if="filter === 0" )
                v-btn( @click="onPrint" )
                  |PRINT
              v-flex( md6 offset-md1 style="padding-top: 22px" v-if="filter === 1" )
                v-btn( @click="onSave" )
                  |LUNAS
                v-btn( @click.native="addProduct = true" )
                  |TAMBAH PESANAN
            v-layout(row wrap v-if="addProduct == true" )
              v-flex( md8 )
                label
                  |Nama Pesanan
                v-autocomplete( :items="products" item-text="name" return-object @change="$refs.qty.focus();$refs.qty.reset()" solo v-model="product" )
              v-flex( md3 offset-md1 )
                label
                  |Banyak
                v-text-field( solo v-model="product.quantity" ref="qty" @keyup.enter="onAddProduct" )
            v-data-table( :headers="detailTable.headers" :items="detailTable.items" v-if="filter === 1" )
                template( slot="items" slot-scope="props" )
                  td
                    |{{ props.item.name }}
                  td
                    |{{ props.item.price }}
                  td
                    v-edit-dialog( :return-value.sync="props.item.quantity" lazy persistent @save="onUpdateProduct(props.item.id, props.item.quantity)" )
                      |{{ props.item.quantity }}
                      v-text-field( slot="input" label="Banyak" v-model="props.item.quantity" single-line counter autofocus )
                  td( class="text-md-center" )
                    v-btn( icon @click="onDeleteProduct(props.item.id)" )
                      v-icon
                        |delete
                template( slot="pageText" slot-scope="{ pageStart, pageStop }" )
                  |Dari {{ pageStart }} sampai {{ pageStop }}
      PrintLayout( :items="detailTable.items" :cash="cash" :total="totalTagihan" :invoice="invoice" id="print-layout" )
</template>

<script>
import axios from 'axios'
import { Printd } from 'printd'
import io from 'socket.io-client'

const url = process.env.API
export default {
  data () {
    return {
      socket: io.connect('192.168.43.3:8000'),
      invoice: '',
      diskon: 0,
      cash: '',
      cashback: 0,
      totalTagihan: 0,
      addProduct: false,
      showDetail: false,
      filter: 1,
      product: {
        quantity: 0
      },
      products: [],
      filterItems: [
        {
          text: 'Belum dibayar',
          value: 1
        },
        {
          text: 'Sudah dibayar',
          value: 0
        }
      ],
      orderTable: {
        headers: [
          {
            text: 'No Pesanan',
            align: 'center',
            sortable: true,
            value: 'number'
          },
          {
            text: 'No Meja',
            align: 'center',
            sortable: true,
            value: 'table_id'
          },
          {
            text: '',
            value: ''
          }
        ],
        items: []
      },
      detailTable: {
        headers: [
          {
            text: 'Nama Pesanan',
            align: 'center',
            sortable: true,
            value: 'product_name'
          },
          {
            text: 'Harga',
            align: 'center',
            sortable: true,
            value: 'price'
          },
          {
            text: 'Banyak Pesanan',
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
      cssText: `
        @page {
          margin: 0;
          size: 58mm auto;
        }
        #print-out {
          font-family: 'Courier New', Courier, monospace
        }
        .w-100 {
          width: 100%;
        }
        .font-8 {
          font-size: 8px;
        }
        .text-right{
          text-align: right;
        }
        .page {
          width: 58mm;
          padding: 0px 2mm;
        }
        .header {
          font-size: 16px;
          margin: 0px;
          padding: 0px;
          text-align: center;
        }
        .address {
          margin: 0px;
          padding; 0px;
          font-size: 10px;
          text-align: center;
          text-transform: uppercase;
          border-bottom: 1px solid black;
        }
        table {
          width: 100%;
          font-size: 12px;
        }
        .item {
          text-transform: uppercase;
          font-family:'Courier New', Courier, monospace
          font-size: 10px;
        }
        .signature-title {
          text-align: center;
          font-size: 10px;
          text-transform: uppercase;
        }
        .bold {
          font-weight: bold;
        }
      `
    }
  },

  computed: {
    filteredItems () {
      return this.orderTable.items.filter(item => item.active === this.filter)
    }
  },

  created () {
    this.socket.on('connect', () => {
      this.socket.on('reload', () => {
        this.loadOrders()
      })
    })
    this.loadProducts()
  },

  mounted () {
    this.loadOrders()
  },

  methods: {
    loadProducts () {
      axios.get(url + '/cashier/product').then(response => {
        this.products = response.data
      })
    },

    loadOrders () {
      axios.get(url + '/cashier/report').then(response => {
        this.orderTable.items = response.data
      })
    },

    async onDetail (number) {
      await axios.get(`${url}/cashier/report/${number}/detail`).then(response => {
        this.detailTable.items = response.data
        this.diskon = response.data[0].disc
        let cash = response.data[0].cash
        if (cash > 0) this.cash = response.data[0].cash
        this.invoice = response.data[0].number
      })
      this.countTotalTagihan()
      this.showDetail = true
      this.$refs.cash.focus()
    },

    countTotalTagihan () {
      let total = 0
      this.detailTable.items.forEach(item => {
        total += item.quantity * item.price
      })
      this.totalTagihan = total - ((this.diskon / 100) * total)
      this.countCashBack()
    },

    countCashBack () {
      this.cashback = this.cash - this.totalTagihan
    },

    async onSave () {
      if (this.cash > 0) {
        let data = {
          cash: this.cash,
          disc: this.diskon
        }
        await axios.post(`${url}/cashier/report/${this.detailTable.items[0].number}/done`, data).then(() => {
          return true
        })
        this.onPrint()
        this.loadOrders()
        this.showDetail = false
      }
    },

    onPrint () {
      const printd = new Printd()
      printd.print(document.getElementById('print-out'), this.cssText)
    },

    async onAddProduct () {
      let number = this.detailTable.items[0].number
      if (this.product.quantity > 0) {
        await axios.post(`${url}/cashier/report/${number}/create`, this.product).then(() => {
          return true
        })
        this.onDetail(number)
        this.countCashBack()
        this.addProduct = false
      }
    },

    async onDeleteProduct (id) {
      let number = this.detailTable.items[0].number
      await axios.post(`${url}/cashier/report/${number}/delete/${id}`).then(() => {
        return true
      })
      this.onDetail(number)
      this.countCashBack()
    },

    async onUpdateProduct (id, quantity) {
      let number = this.detailTable.items[0].number
      await axios.post(`${url}/cashier/report/${number}/update/${id}`, { quantity }).then(() => {
        return true
      })
      this.onDetail(number)
      this.countCashBack()
    }
  },

  components: {
    PrintLayout: () => import('@/components/PrintLayout')
  }
}
</script>
