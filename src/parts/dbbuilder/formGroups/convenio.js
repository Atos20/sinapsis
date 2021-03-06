import React from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import DbInput from '../inputs';
import TransactionRow from '../transaction';
import Tooltip from '@material-ui/core/Tooltip';
import { isMexico } from '../../../vars/countriesDict';
const uuidv4 = require('uuid/v4');
var slugify = require('slugify');


export default class DbFormGroupConvenio extends React.Component{
  state = {
    open: false,
    isedit: false,
    personType: 'convenio',
    fields: {},
    modalChanged: false
  }

  componentDidMount(){
    this.refs = [];
    var self = this;
    window.addEventListener('keydown', function(e){
      var w = e.which;
      var bc = document.body.classList.contains('ss_focusing_input');
      if(w == 13 && !bc && self.state.open){
        self.add();
      }
    })
  }

  close(){
    this.setState({
      open: false,
      modalChanged: false,
      isEdit: false
    })
  }

  open(guid){
    var self = this;
    var isEdit = false;
    if(!guid){
      guid = uuidv4();
    }else{
      isEdit = true;
    }
    this.setState({
      open: true,
      guid: guid,
      fields: {},
      isedit: isEdit
    })
  }

  setChildRef = e => {
    try{
      if(this.state.isedit){
        var guid = this.state.guid;
        e.setValueFromGuid(guid);
      }
    }catch(err){
      console.warn('Sinapsis warning', err);
    }

  }

  add(){
    var self = this;
    window.dispatchEvent(new Event('sinapsisStartLoad'));
    setTimeout(function(){
      var fs = self.state.fields;
      var dbuid = self.props.parent.props.db.id;
      var euid = self.props.empresa.uid;

      window.dbf.addFieldsFromGuid(dbuid, euid, self.state.guid, fs);
      self.close();
      window.dispatchEvent(new Event('sinapsisEndLoad'));
    }, 300)

  }

  insertField(slug, obj, blockchanged){
    slug = this.state.guid + '-' + slug;
    var fs = this.state.fields;
    obj.guid = this.state.guid;
    obj.groupUid = this.state.guid;
    fs[slug] = obj;
    this.setState({
      fields: fs,
    })
    if(!blockchanged){
      this.setState({
        modalChanged: true
      })
    }
  }

  onSelectPersonType(e){
    var t = e.target.value;
    var preSlug = 'tipo persona';
    var slug = slugify(preSlug);
    var obj = {
      group: t,
      value: t,
      bigGroup: 'persona',
      isvalid: true,
      guid: this.state.guid,
      groupUid: this.state.guid,
      name: 'Tipo de persona'
    };
    this.setState({
      personType: t
    })
    this.insertField(slug, obj, true);
  }

  getGroup(){
    var type = "convenio";
    var dbuid = this.props.parent.props.db.id;
    var euid = this.props.empresa.uid;
    var gr = window.dbf.getEmpresaGroupsByGroup(dbuid, euid, type);
    return gr;
  }

  editContrato(guid){
    this.open(guid);
  }

  render(){
    var self = this;
    var addL = this.state.isedit ? 'Guardar' : 'Agregar';
    var convenios = this.getGroup();

    return(
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
          <div className="dbef_n">
            <div className="dbef_n_n">
              Convenios <span className="dbef_n_n_badge">{convenios.length}</span>
              {
                isMexico() ?
                <div className="dbef_n_tooltip">
                  <Tooltip
                    title="Puedes conseguir esta información desde la ASF. Da clic para visitar el sitio"
                  >
                    <a href="https://www.asf.gob.mx/Default/Index" target="_blank">
                      <Icon size="small">help</Icon>
                    </a>
                  </Tooltip>
                </div>
                : null
              }
            </div>
            <div className="dbef_n_ctas">
              <div className="dbef_n_ctas_c" onClick={() => this.open()}>Agregar</div>
            </div>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className="db_empresa_container_group_form">
            {
              convenios.length ?
              <div className="db_empresa_container_group_form_innerlist">
                {
                  convenios.map(function(e, k){
                    return (
                      <TransactionRow
                        parent={self}
                        g={e}
                        key={k}
                        db={self.props.parent.props.db}
                        empresa={self.props.empresa}
                        count={k + 1}
                        onClick={(uid) => self.editContrato(uid)}
                        singleName="Convenio"
                      />
                    )
                  })
                }
              </div>
              :
              <div className="db_empresa_container_group_form_empty">
                Sin convenios
              </div>
            }
          </div>
        </ExpansionPanelDetails>

        {/* Modal */}
        <Dialog open={this.state.open} onClose={() => this.close()} className="ss_modal_edit">
          <DialogTitle>{addL} convenio</DialogTitle>
          <DialogContent>
            <div className="db_empresa_container_group_form">
                  <>
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      matchWith={['instancia']}
                      name="¿Quién otorga los recursos?"
                      aka="¿Qué instancia otorga los recursos?"
                      type="text"
                      category="emisor"
                      group="convenio"
                      description='Nombre de la dependencia que otorga (recomendamos escribir siglas, ej. SEDESOL), nombre de la instancia (puede ser el de una universidad, ej. UAEM).'
                      empresa={this.props.empresa}
                      db={this.props.parent.props.db}
                      ref={this.setChildRef}
                    />
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      matchWith={['instancia']}
                      name="¿Quién recibe los recursos?"
                      description='Nombre de la dependencia que recibe (recomendamos escribir siglas, ej. SEDESOL), nombre de la instancia (puede ser el de una universidad, ej. UAEM).'
                      aka="¿Qué instancia recibe los recursos?"
                      type="text"
                      category="receptor"
                      group="convenio"
                      empresa={this.props.empresa}
                      db={this.props.parent.props.db}
                      ref={this.setChildRef}
                    />
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      matchWith={['convenio']}
                      name="Número de convenio"
                      type="text"
                      group="convenio"
                      empresa={this.props.empresa}
                      db={this.props.parent.props.db}
                      ref={this.setChildRef}
                    />
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      name="Fecha de inicio"
                      type="date"
                      matchWith={['date']}
                      group="convenio"
                      empresa={this.props.empresa}
                      db={this.props.parent.props.db}
                      ref={this.setChildRef}
                    />
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      name="Fecha de término"
                      type="text"
                      group="convenio"
                      matchWith={['date']}
                      empresa={this.props.empresa}
                      db={this.props.parent.props.db}
                      ref={this.setChildRef}
                    />
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      name="Objeto del convenio"
                      type="text"
                      description='Es la descripción de las actividades que se van a llevar a cabo durante el convenio, por ejemplo "consultoría en tecnología" o "servicios de arquitectura y construcción"'
                      group="convenio"
                      empresa={this.props.empresa}
                      db={this.props.parent.props.db}
                      ref={this.setChildRef}
                    />
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      matchWith={['person']}
                      name="Persona que firma (otorga)"
                      aka="Nombre de la persona que firma de la instancia que otorga los recursos"
                      type="text"
                      group="convenio"
                      empresa={this.props.empresa}
                      db={this.props.parent.props.db}
                      ref={this.setChildRef}
                    />
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      name="Cargo de quien firma (otorga)"
                      aka="Cargo de quien firma de la instancia que otorga los recursos"
                      type="text"
                      group="convenio"
                      empresa={this.props.empresa}
                      db={this.props.parent.props.db}
                      ref={this.setChildRef}
                    />
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      matchWith={['person']}
                      name="Persona que firma (recibe)"
                      aka="Nombre de la persona que firma de la instancia que recibe los recursos"
                      type="text"
                      group="convenio"
                      empresa={this.props.empresa}
                      db={this.props.parent.props.db}
                      ref={this.setChildRef}
                    />
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      name="Cargo de quien firma (recibe)"
                      aka="Cargo de quien firma de la instancia que recibe los recursos"
                      type="text"
                      group="convenio"
                      empresa={this.props.empresa}
                      db={this.props.parent.props.db}
                      ref={this.setChildRef}
                    />
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      name="Monto del convenio"
                      type="currency"
                      group="convenio"
                      category="monto"
                      sumWith={['montos_convenio']}
                      empresa={this.props.empresa}
                      db={this.props.parent.props.db}
                      ref={this.setChildRef}
                    />
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      matchWith={['person', 'titular']}
                      name="Titular de instancia que otorga al momento de firmar el convenio"
                      aka="Titular de instancia que otorga al momento de firmar el convenio"
                      type="text"
                      group="convenio"
                      empresa={this.props.empresa}
                      db={this.props.parent.props.db}
                      ref={this.setChildRef}
                    />
                    <DbInput
                      onChange={(slug, obj) => this.insertField(slug, obj)}
                      matchWith={['person', 'titular']}
                      name="Titular de instancia que recibe al momento de firmar el convenio"
                      aka="Titular de instancia que recibe al momento de firmar el convenio"
                      type="text"
                      group="convenio"
                      empresa={this.props.empresa}
                      db={this.props.parent.props.db}
                      ref={this.setChildRef}
                    />
                  </>
            </div>
          </DialogContent>
          <DialogActions>
            <Button color="secondary" onClick={() => this.close()}>
              Cancelar
            </Button>
            <Button color="secondary" onClick={() => this.add()}>
              {addL}
            </Button>
          </DialogActions>
        </Dialog>
      </ExpansionPanel>
    )
  }
}
