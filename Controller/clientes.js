// Definições - Loki
let read = require('read-file-utf8')
let loki = require('lokijs')  // Mesmo que "import"  
let db = new loki('Views/db.json')
let fileExists = require('file-exists')
const vue = require('vue')
let sClienteNomeOld = ''
let sClienteCpfOld = ''
let sClienteTelOld = 1

// Alertas - Swal.js
const Swal = require('sweetalert2')

let data = {}
if (fileExists(__dirname + '/db.json')) {
    data = read(__dirname + '/db.json')
    db.loadJSON(data)
} else {
    db.addCollection('vendas')
    db.addCollection('Clientes')
    db.addCollection('produtos')
    db.save()
}
window.Vue = require('vue')
// Definindo o banco de dados de Clientes
let clientes = db.getCollection('Clientes')

class Clientes {
    constructor(model) {
        this.model = model;
        this.clientes = this.clientes;
    }

    /**
     * @private
     * @param {String} sNome 
     * @returns 
     */
    _validaNome(sNome) {
        return sNome.replace(/[^a-zA-ZÀ-ú ]/g, "") == sNome ? true : false;
    }

    /**
     * @private
     * @param {String} sTelefone 
     * @returns 
    */
    _validaTelefone(sTelefone) {
        return sTelefone.replace(/[^0-9]/g, "") == sTelefone ? true : false;
    }

    /**
     * @private
     * @param {String} sCpf 
     * @returns 
     */
    _validaCpf(sCpf) {
        let soma = 0;
        let resto;
        let regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

        if (regex.test(sCpf)) {
            return false;

        } else {
            if (sCpf == "00000000000") return false;

            for (var i = 1; i <= 9; i++)
                soma = soma + parseInt(sCpf.substring(i - 1, i)) * (11 - i);
            resto = (soma * 10) % 11;

            if (resto == 10 || resto == 11) resto = 0;
            if (resto != parseInt(sCpf.substring(9, 10))) return false;

            soma = 0;
            for (i = 1; i <= 10; i++)
                soma = soma + parseInt(sCpf.substring(i - 1, i)) * (12 - i);
            resto = (soma * 10) % 11;

            if (resto == 10 || resto == 11) resto = 0;
            if (resto != parseInt(sCpf.substring(10, 11))) return false;
            return true;
        }
    }

    /**
     * @private
     * @param {String} sCpf 
     * @param {String} sMode 
     * @returns 
     */
    _validaCpfDuplicado(sCpf, sMode) {
        let sClienteCpf = clientes.find({ cpf: sCpf })

        if (sClienteCpf.length <= 0) {
            return true

        } else if (sClienteCpf[0].cpf === sCpf){

            if (sMode === 'editar') {
                return true
            } else {
                return false
            }
        }
        
    }

    /**
     * @public
     * @param {Object} oResult 
    */
    sweetAlert(oResult){
        Swal.fire({
            title: oResult.title,
            text: oResult.text,
            icon: oResult.icon,
            confirmButtonText: oResult.confirmButtonText
        })
    }

    /**
     * @public
     * @param {Object} oCliente 
     * @returns
    */
    validaCadastro(oCliente, sModo) {
        let sClienteNome = oCliente.nome
        let nClienteTel = oCliente.telefone
        let sMode = sModo === "cadastro" ? 'cadastrar' : 'editar'
        let oResult = {
            title: '',
            text: '',
            icon: '',
            confirmButtonText: '',
            result: false
        }

        if ((sClienteNome == '' || sClienteNome == null ) || (nClienteTel == '' || nClienteTel == null) ||
            (oCliente.cpf == '' || oCliente.cpf == null)) { 
            oResult.title = `Erro ao ${sMode} o cliente`
            oResult.text = 'Todos os campos devem estar preenchidos'
            oResult.icon = 'error'
            oResult.confirmButtonText = 'Ok'
            oResult.result = false

        } else if (this._validaNome(oCliente.nome) == false) {
            oResult.title = `Erro ao ${sMode} o cliente`
            oResult.text = 'Nome inválido'
            oResult.icon = 'error'
            oResult.confirmButtonText = 'Ok'
            oResult.result = false

        } else if (this._validaCpf(oCliente.cpf) == false) {
            oResult.title = `Erro ao ${sMode} o cliente`
            oResult.text = 'CPF inválido'
            oResult.icon = 'error'
            oResult.confirmButtonText = 'Ok'
            oResult.result = false

        } else if (this._validaCpfDuplicado(oCliente.cpf, sMode) == false) {
            oResult.title = `Erro ao ${sMode} o cliente`
            oResult.text = 'CPF já cadastrado'
            oResult.icon = 'error'
            oResult.confirmButtonText = 'Ok'
            oResult.result = false
            
        } else if (this._validaTelefone(oCliente.telefone) == false) {
            oResult.title = `Erro ao ${sMode} o cliente`
            oResult.text = 'Telefone inválido'
            oResult.icon = 'error'
            oResult.confirmButtonText = 'Ok'
            oResult.result = false

        } else {
            oResult.title = 'Sucesso'
            oResult.text = `Cliente ${sClienteNome} ${sMode === 'cadastrar' ? 'cadastrado' : 'editado'} com sucesso`
            oResult.icon = 'success'
            oResult.confirmButtonText = 'Ok'
            oResult.result = true
        }
        return oResult
    }  
}

new Vue({
    el: 'body',
    data: {
        clientes: [],
        mode: '',
        client: {
            nome: '',
            cpf: '',
            telefone: ''
        },
        openModal: false  // Começa fechado

    },
    ready: function () {
        this.clientes = clientes.data;
        console.log(this.clientes)
    },
    methods: {
        editClient: function (client) {
            this.mode = 'edicao'
            this.openModal = true
            this.client = client

            sClienteNomeOld = this.client.nome
            sClienteCpfOld = this.client.cpf
            sClienteTelOld = this.client.telefone
        },
        createClient: function () {
            this.mode = 'cadastro'
            this.openModal = true
            this.client = { // Reinicializando os dados por precaução
                nome: '',
                cpf: '',
                telefone: ''
            }
        },
        clientStoreOrUpdate: function () {
            let clienteClass = new Clientes(this)
            let oCliente = this.client
            let oResult = clienteClass.validaCadastro(oCliente, this.mode)
            this.openModal = false

            clienteClass.sweetAlert(oResult)

            if (oResult.result) {
                if (this.mode == 'cadastro') {
                    clientes.insert(oCliente)
                } else {
                    clientes.update(oCliente)
                }
                db.save()
            } else {
                oCliente.nome = sClienteNomeOld
                oCliente.cpf = sClienteCpfOld
                oCliente.telefone = sClienteTelOld
                clientes.update(oCliente)
                db.save()
            }
        }
    }
})