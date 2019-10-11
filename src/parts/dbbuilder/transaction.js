import React from 'react';
import Icon from '@material-ui/core/Icon';

export default class TransactionRow extends React.Component{
  buildName(){
    var f = this.props.g;
    var t = f[0];
    var emisor, monto, receptor = false;
    if(t.group !== "transferencia"){
      // console.log('t', t.category);
      f.map(function(e){
        switch(e.category){
          case "emisor":
            emisor = e.value;
          break;
          case "monto":
            monto = e.value;
          break;
          case "receptor":
            receptor = e.value;
          break;
        }
      })
      if(this.props.receptorIsEmpresa){
        receptor = this.props.empresa.name;
      }
      if(t.group == "contrato"){
        receptor = false;
      }
    }else{
      var type = f.find(function(_d){
        return _d.name == "Tipo de transferencia"
      });

      if(type){
        var _t = type.value;
        if(_t == "receptor"){
          receptor = this.props.empresa.name;
          var emisorGroup = f.find(function(_d){
            return _d.category == "emisor"
          });
          if(emisorGroup){
            emisor = emisorGroup.value;
          }
        }else{
          emisor = this.props.empresa.name;
          var receptorGroup = f.find(function(_d){
            return _d.category == "receptor"
          });
          if(receptorGroup){
            receptor = receptorGroup.value;
          }
        }

        var montoGroup = f.find(function(_d){
          return _d.category == "monto"
        });

        if(montoGroup){
          monto = montoGroup.value;
        }
      }
    }

    var o = {
      receptor: receptor,
      emisor: emisor,
      monto: monto,
      showT: emisor ? true : false
    };
    return o;
  }

  edit(){
    var uid = this.props.g[0].groupUid || this.props.g[0].guid ;
    console.log('UID', uid);
    this.props.onClick(uid);
  }

  delete(){
    var g = this.props.g;
    var t = g[0];
    var euid = t.empresauid;
    var dbid = t.fromdb;
    var guid = t.groupUid;

    window.dbf.deleteGroup(guid, euid, dbid);
  }

  render(){
    var n = this.buildName();
    return(
      <div className="ss_transaction_row">
        <div className="ss_transaction_row_c" onClick={() => this.edit()}>
          <div className="ss_transaction_row_n">
            {
              n.showT ?
              <div className="ss_transaction_row_n_d">
                <div className="ss_transaction_row_n_d_t">
                  {n.emisor}
                </div>
                {
                  n.receptor ?
                  <>
                  <div className="ss_transaction_row_n_d_a">
                    →
                  </div>
                  <div className="ss_transaction_row_n_d_t">
                    {n.receptor}
                  </div>
                  </>
                : null
                }

              </div>
              :
              <div className="ss_transaction_row_n_full">
                {this.props.singleName + ' #' + this.props.count}
              </div>
            }
          </div>
          <div className="ss_transaction_row_d">
            {
              n.monto ? window.dbf.fm(n.monto) : null
            }
          </div>
        </div>
        <div className="ss_transaction_row_d" onClick={() => this.delete()}>
          <Icon size="small">delete</Icon>
        </div>
      </div>
    )
  }
}
