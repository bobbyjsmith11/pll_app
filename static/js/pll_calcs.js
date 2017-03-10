/* Create extra units so user input is
 * non-case-sensitive
*/

window.onload = function() {
  math.createUnit("HZ",  {definition: "1 Hz",  aliases: ['hz']  } );
  math.createUnit("MHZ", {definition: "1 MHz", aliases: ["Mhz"]  } );
  math.createUnit("GHZ", {definition: "1 GHz", aliases: ["Ghz"]  } );
  math.createUnit("THZ", {definition: "1 THz", aliases: ["Thz"]  } );
  
  // math.createUnit("Ohm",  {definition: "1 ohm",  aliases: ['OHM']  } );
  math.createUnit("kOhm",  {definition: "1 kohm",  aliases: ['KOHM', 'kOHM']  } );
  math.createUnit("MOhm",  {definition: "1 Mohm",  aliases: ['MOHM']  } );
  math.createUnit("GOhm",  {definition: "1 Gohm",  aliases: ['GOHM']  } );
  math.createUnit("TOhm",  {definition: "1 Tohm",  aliases: ['OHM']  } );
  
  // math.createUnit("HZ/V",  {definition: "1 Hz",  aliases: ['hz/V','Hz/V']  } );
  // math.createUnit("MHZ/V", {definition: "1 MHz", aliases: ["Mhz/V", "MHz/V"]  } );
  // math.createUnit("GHZ/V", {definition: "1 GHz", aliases: ["Ghz/V", "GHz/V"]  } );
  // math.createUnit("THZ/V", {definition: "1 THz", aliases: ["Thz/V", "THz/V"]  } );
  
  getFref();
  getR();
  getFpfd();
  getN();
  getFout();
  getFc();
  getKphi();
  getKvco();
  getPm();
  getFom();

  // synthPll();
  setFilterType();
  // document.getElementById("refPnTable").addEventListener('change', refTableChangedHandler)
  //
  var refTable = document.getElementById("refPnTable");
  refTable.addEventListener('focusout', refTableChangedHandler);
  refTable.addEventListener('keydown', checkForEnter, true);
  refPhaseNoise = readReferencePhaseNoise();  // global variable
  refTableChangedHandler();
  graphReferencePhaseNoise();

  var vcoTable = document.getElementById("vcoPnTable");
  vcoTable.addEventListener('focusout', vcoTableChangedHandler);
  vcoTable.addEventListener('keydown', checkForEnter, true);
  vcoPhaseNoise = readVcoPhaseNoise();  // global variable
  vcoTableChangedHandler();
  graphVcoPhaseNoise();


}

var PM_PLOT_PRESENT = false;  // indicates that plotGainPhaseMargin has been called at least once
var CL_PLOT_PRESENT = false;  // indicates that plotClosedLoop has been called at least once
var REF_PLOT_PRESENT = false; // indicates that plotReferencePhaseNoise has been called at least once 
var VCO_PLOT_PRESENT = false; // indicates that plotVcoPhaseNoise has been called at least once 
var PN_PLOT_PRESENT = false;  // indicates that simulatePhaseNoise has been called at least once

/* Global object for storing all parameters for
 * the phase-locked loop
 */
var pll =   { fref:     10e6,
              R:        200,
              fpfd:     50e3,
              N:        39200,
              fout:     1960e6,
              fc:       10e3,
              kphi:     1e-3,
              kvco:     60e6,
              pm:       49.2,
              fom:      -227,
              flicker:  -300
            };

// supports up to 4th order passive or active
var loop_filter = { r2: 0,
                    r3: 0,
                    r4: 0,
                    c1: 0,
                    c2: 0,
                    c3: 0,
                    c4: 0,
                    a0: 0,
                    a1: 0,
                    a2: 0,
                    a3: 0,
                    t1: 0,
                    t2: 0,
                    t3: 0,
                    t4: 0,
                    type: 'passive',
                    order: 2 };

function get_pll_properties () {

  pll.fpfd = math.unit(document.getElementById("fpfd").value);
  pll.fout = math.unit(document.getElementById("fout").value);
  pll.N = math.unit(document.getElementById("fout").value);
}


function synthPll () {
  if ( (loop_filter.type == 'passive') && (loop_filter.order == 2) ) {
    solveComponents( loop_type='passive2', gamma=1.024 );
  } else if ( (loop_filter.type == 'passive') && (loop_filter.order == 3) ) {
    solveComponents( loop_type='passive3', gamma=1.005 );
  } else if ( (loop_filter.type == 'passive') && (loop_filter.order == 4) ) {
    solveComponents( loop_type='passive4', gamma=1.115 );
  } 
   
}

function simulatePll( ) {
  my_url = "/pll_app/pll_calcs/callSimulatePll?"
  dat = "fstart=" + 1
        + "&fstop=" + 100e6
        + "&ptsPerDec=" + 99
        + "&kphi=" + pll.kphi
        + "&kvco=" + pll.kvco
        + "&N=" + pll.N
        + "&R=" + pll.R
        + "&flt_type=" + loop_filter.type
        + "&c1=" + loop_filter.c1
        + "&c2=" + loop_filter.c2
        + "&r2=" + loop_filter.r2
        + "&c3=" + loop_filter.c3 
        + "&c4=" + loop_filter.c4 
        + "&r3=" + loop_filter.r3 
        + "&r4=" + loop_filter.r4;
  $.ajax( {
            type: "GET",
            url: my_url,
            datatype: 'json',
            async: true,
            data: dat,
            success: function (data) {
              // console.log(data)
              if (PM_PLOT_PRESENT) {
                updateGainPhaseMarginGraph( data.gains , data.phases, data.freqs );
                setPm(data.pzero);
                setFc(data.fzero); 
                updateClosedLoopGraph( data.ref_cl , data.vco_cl, data.freqs );
              } else {
                plotGainPhaseMargin( data.gains , data.phases, data.freqs );
                PM_PLOT_PRESENT = true;  
                plotClosedLoop( data.ref_cl , data.vco_cl, data.freqs );
                CL_PLOT_PRESENT = true;  
              }
              
              simulatePhaseNoise();
            },
            error: function (result) {
            }
  });
}

function simulatePhaseNoise() {

  my_url = "/pll_app/pll_calcs/callSimulatePhaseNoise?"
  dat = "freqs=" + refPhaseNoise.freqs 
        + "&refPn=" + refPhaseNoise.pns
        + "&vcoPn=" + vcoPhaseNoise.pns
        + "&pllFom=" + pll.fom
        + "&kphi=" + pll.kphi
        + "&kvco=" + pll.kvco
        + "&fpfd=" + pll.fpfd
        + "&N=" + pll.N
        + "&R=" + pll.R
        + "&flt_type=" + loop_filter.type
        + "&c1=" + loop_filter.c1
        + "&c2=" + loop_filter.c2
        + "&r2=" + loop_filter.r2
        + "&c3=" + loop_filter.c3 
        + "&c4=" + loop_filter.c4 
        + "&r3=" + loop_filter.r3 
        + "&r4=" + loop_filter.r4;

  $.ajax( {
            type: "GET",
            url: my_url,
            datatype: 'json',
            async: true,
            data: dat,
            success: function (data) {
              if (PN_PLOT_PRESENT) {
                updatePhaseNoise( data.freqs,
                                  data.refPnOut,
                                  data.vcoPnOut,
                                  data.icPnOut,
                                  data.compositePn );
              } else {
                plotPhaseNoise( data.freqs,
                                data.refPnOut,
                                data.vcoPnOut,
                                data.icPnOut,
                                data.compositePn );
                PN_PLOT_PRESENT = true;
                // console.log(data);
              }
            },
            error: function (result) {
            }
  });

}

function graphReferencePhaseNoise() {
  my_url = "/pll_app/pll_calcs/callGetInterpolatedPhaseNoise?"
  dat = "fstart=" + math.min( refPhaseNoise.freqs ) 
        + "&fstop=" + math.max( refPhaseNoise.freqs ) 
        + "&numPts=" + 1000 
        + "&freqs=" + refPhaseNoise.freqs
        + "&pns=" + refPhaseNoise.pns;

  $.ajax( {
            type: "GET",
            url: my_url,
            datatype: 'json',
            async: true,
            data: dat,
            success: function (data) {
              if (REF_PLOT_PRESENT) {
                updateReferencePhaseNoise( data.pns, data.freqs );
              } else {
                plotReferencePhaseNoise( data.pns, data.freqs );
                REF_PLOT_PRESENT = true;  
              }
            },
            error: function (result) {
            }
  });
}

function graphVcoPhaseNoise() {
  my_url = "/pll_app/pll_calcs/callGetInterpolatedPhaseNoise?"
  dat = "fstart=" + math.min( vcoPhaseNoise.freqs ) 
        + "&fstop=" + math.max( vcoPhaseNoise.freqs ) 
        + "&numPts=" + 1000 
        + "&freqs=" + vcoPhaseNoise.freqs
        + "&pns=" + vcoPhaseNoise.pns;

  $.ajax( {
            type: "GET",
            url: my_url,
            datatype: 'json',
            async: true,
            data: dat,
            success: function (data) {
              if (VCO_PLOT_PRESENT) {
                updateVcoPhaseNoise( data.pns, data.freqs );
              } else {
                plotVcoPhaseNoise( data.pns, data.freqs );
                VCO_PLOT_PRESENT = true;  
              }
            },
            error: function (result) {
            }
  });
}
function setFilterType() {
  if ( document.getElementById("selFilterType").value == 0 ) {
    loop_filter.type = 'passive';
    loop_filter.order = 2;
    loadPll2PassiveForm();
  } else if ( document.getElementById("selFilterType").value == 1 ) {
    loop_filter.type = 'passive';
    loop_filter.order = 3;
    loadPll3PassiveForm();
  } else if ( document.getElementById("selFilterType").value == 2 ) {
    loop_filter.type = 'passive';
    loop_filter.order = 4;
    loadPll4PassiveForm();
  } else if ( document.getElementById("selFilterType").value == 3 ) {
    loop_filter.type = 'passive';
    loop_filter.order = 4;
    loadPll4PassiveForm2();
    // loop_filter.type = 'active';
    // loop_filter.order = 2;
  } else if ( document.getElementById("selFilterType").value == 4 ) {
    loop_filter.type = 'active';
    loop_filter.order = 3;
  } else if ( document.getElementById("selFilterType").value == 5 ) {
    loop_filter.type = 'active';
    loop_filter.order = 4;
  } else if ( document.getElementById("selFilterType").value == 6 ) {
    console.log('new filter type');
  }
 synthPll(); 
}

/* move all of the form inputs to the appropriate div
 * and shows the appropriate image
 */
function loadPll4PassiveForm() {
  
  document.getElementById("pll3_passive_div").style.display = "none";
  document.getElementById("pll2_passive_div").style.display = "none";

  document.getElementById("pll4_passive_div").style.display = "inline-block";

  var mydiv = "#pll4_passive_div";

  $("#fltTypeLabel").detach().appendTo(mydiv);

 
  $("#fcLabel").detach().appendTo(mydiv);
  document.getElementById("fcLabel").style.display = "block";
  document.getElementById("fcLabel").style.top = "17%";
  document.getElementById("fcLabel").style.left = "0%";

  $("#fc").detach().appendTo(mydiv);
  document.getElementById("fc").style.display = "block";
  document.getElementById("fc").style.top = "16%";
  document.getElementById("fc").style.left = "18%";

  $("#pmLabel").detach().appendTo(mydiv);
  document.getElementById("pmLabel").style.display = "block";
  document.getElementById("pmLabel").style.top = "1%";
  document.getElementById("pmLabel").style.left = "0%";

  $("#pm").detach().appendTo(mydiv);
  document.getElementById("pm").style.display = "block";
  document.getElementById("pm").style.top = "0%";
  document.getElementById("pm").style.left = "18%";

  $("#selFilterType").detach().appendTo(mydiv);
  document.getElementById("selFilterType").style.display = "block";
  document.getElementById("selFilterType").style.top = "0%";
  document.getElementById("selFilterType").style.left = "70%";

  // 1st 
  $("#c1").detach().appendTo(mydiv);
  document.getElementById("c1").style.display = "block";
  document.getElementById("c1").style.top = "54%";
  document.getElementById("c1").style.left = "9.5%";

  $("#t1Label").detach().appendTo(mydiv);
  document.getElementById("t1Label").style.display = "none";

  $("#t1").detach().appendTo(mydiv);
  document.getElementById("t1").style.display = "none";

  // 2nd
  $("#r2").detach().appendTo(mydiv);
  document.getElementById("r2").style.display = "block";
  document.getElementById("r2").style.top = "68%";
  document.getElementById("r2").style.left = "33%";

  $("#c2").detach().appendTo(mydiv);
  document.getElementById("c2").style.display = "block";
  document.getElementById("c2").style.top = "48%";
  document.getElementById("c2").style.left = "33%";

  $("#t2Label").detach().appendTo(mydiv);
  document.getElementById("t2Label").style.display = "none";

  $("#t2").detach().appendTo(mydiv);
  document.getElementById("t2").style.display = "none";

  // 3rd
  $("#r3").detach().appendTo(mydiv);
  document.getElementById("r3").style.display = "block";
  document.getElementById("r3").style.top = "25%";
  document.getElementById("r3").style.left = "43%";

  $("#c3").detach().appendTo(mydiv);
  document.getElementById("c3").style.display = "block";
  document.getElementById("c3").style.top = "54%";
  document.getElementById("c3").style.left = "60%";

  $("#t3Label").detach().appendTo(mydiv);
  document.getElementById("t3Label").style.display = "none";

  $("#t3").detach().appendTo(mydiv);
  document.getElementById("t3").style.display = "none";

  // 4th
  $("#r4").detach().appendTo(mydiv);
  document.getElementById("r4").style.display = "block";
  document.getElementById("r4").style.top = "25%";
  document.getElementById("r4").style.left = "68%";

  $("#c4").detach().appendTo(mydiv);
  document.getElementById("c4").style.display = "block";
  document.getElementById("c4").style.top = "54%";
  document.getElementById("c4").style.left = "85%";

  $("#t4Label").detach().appendTo(mydiv);
  document.getElementById("t4Label").style.display = "none";

  $("#t4").detach().appendTo(mydiv);
  document.getElementById("t4").style.display = "none";

}

/* move all of the form inputs to the appropriate div
 * and shows the appropriate image
 */
function loadPll3PassiveForm() {
  document.getElementById("pll2_passive_div").style.display = "none";
  document.getElementById("pll4_passive_div").style.display = "none";

  document.getElementById("pll3_passive_div").style.display = "inline-block";

  var mydiv = "#pll3_passive_div";

  $("#fltTypeLabel").detach().appendTo(mydiv);
 
  $("#fcLabel").detach().appendTo(mydiv);
  document.getElementById("fcLabel").style.display = "block";
  document.getElementById("fcLabel").style.top = "17%";
  document.getElementById("fcLabel").style.left = "0%";

  $("#fc").detach().appendTo(mydiv);
  document.getElementById("fc").style.display = "block";
  document.getElementById("fc").style.top = "16%";
  document.getElementById("fc").style.left = "18%";

  $("#pmLabel").detach().appendTo(mydiv);
  document.getElementById("pmLabel").style.display = "block";
  document.getElementById("pmLabel").style.top = "1%";
  document.getElementById("pmLabel").style.left = "0%";

  $("#pm").detach().appendTo(mydiv);
  document.getElementById("pm").style.display = "block";
  document.getElementById("pm").style.top = "0%";
  document.getElementById("pm").style.left = "18%";


  $("#selFilterType").detach().appendTo(mydiv);
  document.getElementById("selFilterType").style.display = "block";
  document.getElementById("selFilterType").style.top = "0%";
  document.getElementById("selFilterType").style.left = "70%";

  // 1st 
  $("#c1").detach().appendTo(mydiv);
  document.getElementById("c1").style.display = "block";
  document.getElementById("c1").style.top = "54%";
  document.getElementById("c1").style.left = "9.5%";

  $("#t1Label").detach().appendTo(mydiv);
  document.getElementById("t1Label").style.display = "none";

  $("#t1").detach().appendTo(mydiv);
  document.getElementById("t1").style.display = "none";

  // 2nd
  $("#r2").detach().appendTo(mydiv);
  document.getElementById("r2").style.display = "block";
  document.getElementById("r2").style.top = "68%";
  document.getElementById("r2").style.left = "33%";

  $("#c2").detach().appendTo(mydiv);
  document.getElementById("c2").style.display = "block";
  document.getElementById("c2").style.top = "48%";
  document.getElementById("c2").style.left = "33%";

  $("#t2Label").detach().appendTo(mydiv);
  document.getElementById("t2Label").style.display = "none";

  $("#t2").detach().appendTo(mydiv);
  document.getElementById("t2").style.display = "none";

  // 3rd
  $("#r3").detach().appendTo(mydiv);
  document.getElementById("r3").style.display = "block";
  document.getElementById("r3").style.top = "25%";
  document.getElementById("r3").style.left = "43%";

  $("#c3").detach().appendTo(mydiv);
  document.getElementById("c3").style.display = "block";
  document.getElementById("c3").style.top = "54%";
  document.getElementById("c3").style.left = "60%";

  $("#t3Label").detach().appendTo(mydiv);
  document.getElementById("t3Label").style.display = "none";

  $("#t3").detach().appendTo(mydiv);
  document.getElementById("t3").style.display = "none";

  // 4th
  $("#r4").detach().appendTo(mydiv);
  document.getElementById("r4").style.display = "none";

  $("#c4").detach().appendTo(mydiv);
  document.getElementById("c4").style.display = "none";

  $("#t4Label").detach().appendTo(mydiv);
  document.getElementById("t4Label").style.display = "none";

  $("#t4").detach().appendTo(mydiv);
  document.getElementById("t4").style.display = "none";

}


/* move all of the form inputs to the appropriate div
 * and shows the appropriate image
 */
function loadPll2PassiveForm() {
  
  document.getElementById("pll3_passive_div").style.display = "none";
  document.getElementById("pll4_passive_div").style.display = "none";

  document.getElementById("pll2_passive_div").style.display = "inline-block";

  var mydiv = "#pll2_passive_div";

  $("#fltTypeLabel").detach().appendTo(mydiv);

 
  $("#fcLabel").detach().appendTo(mydiv);
  document.getElementById("fcLabel").style.display = "block";
  document.getElementById("fcLabel").style.top = "17%";
  document.getElementById("fcLabel").style.left = "0%";

  $("#fc").detach().appendTo(mydiv);
  document.getElementById("fc").style.display = "block";
  document.getElementById("fc").style.top = "16%";
  document.getElementById("fc").style.left = "18%";

  $("#pmLabel").detach().appendTo(mydiv);
  document.getElementById("pmLabel").style.display = "block";
  document.getElementById("pmLabel").style.top = "1%";
  document.getElementById("pmLabel").style.left = "0%";

  $("#pm").detach().appendTo(mydiv);
  document.getElementById("pm").style.display = "block";
  document.getElementById("pm").style.top = "0%";
  document.getElementById("pm").style.left = "18%";


  $("#selFilterType").detach().appendTo(mydiv);
  document.getElementById("selFilterType").style.display = "block";
  document.getElementById("selFilterType").style.top = "0%";
  document.getElementById("selFilterType").style.left = "70%";

  // 1st 
  $("#c1").detach().appendTo(mydiv);
  document.getElementById("c1").style.display = "block";
  document.getElementById("c1").style.top = "54%";
  document.getElementById("c1").style.left = "9.5%";

  $("#t1Label").detach().appendTo(mydiv);
  document.getElementById("t1Label").style.display = "none";

  $("#t1").detach().appendTo(mydiv);
  document.getElementById("t1").style.display = "none";

  // 2nd
  $("#r2").detach().appendTo(mydiv);
  document.getElementById("r2").style.display = "block";
  document.getElementById("r2").style.top = "68%";
  document.getElementById("r2").style.left = "33%";

  $("#c2").detach().appendTo(mydiv);
  document.getElementById("c2").style.display = "block";
  document.getElementById("c2").style.top = "48%";
  document.getElementById("c2").style.left = "33%";

  $("#t2Label").detach().appendTo(mydiv);
  document.getElementById("t2Label").style.display = "none";

  $("#t2").detach().appendTo(mydiv);
  document.getElementById("t2").style.display = "none";

  // 3rd
  $("#r3").detach().appendTo(mydiv);
  document.getElementById("r3").style.display = "none";

  $("#c3").detach().appendTo(mydiv);
  document.getElementById("c3").style.display = "none";

  $("#t3Label").detach().appendTo(mydiv);
  document.getElementById("t3Label").style.display = "none";

  $("#t3").detach().appendTo(mydiv);
  document.getElementById("t3").style.display = "none";

  // 4th
  $("#r4").detach().appendTo(mydiv);
  document.getElementById("r4").style.display = "none";

  $("#c4").detach().appendTo(mydiv);
  document.getElementById("c4").style.display = "none";

  $("#t4Label").detach().appendTo(mydiv);
  document.getElementById("t4Label").style.display = "none";

  $("#t4").detach().appendTo(mydiv);
  document.getElementById("t4").style.display = "none";

}


function solveComponents( loop_type, gamma ) {
  my_url = "/pll_app/pll_calcs/solveForComponents?";
  dat = "loop_type=" + loop_type 
        + "&fc=" + pll.fc 
        + "&pm=" + pll.pm
        + "&kphi=" + pll.kphi
        + "&kvco=" + pll.kvco
        + "&N=" + pll.N
        + "&gamma=" + gamma;

  $.ajax( {
            type: "GET",
            url: my_url,
            datatype: 'json',
            async: true,
            data: dat,
            success: function (data) {
              RET_DATA = data
              setT1(data.t1);
              setT2(data.t2);
              setT3(data.t3);
              setT4(data.t4);
              setA0(data.a0);
              setA1(data.a1);
              setA2(data.a2);
              setA3(data.a3);
              setC1(data.c1);
              setC2(data.c2);
              setC3(data.c3);
              setC4(data.c4);
              setR2(data.r2);
              setR3(data.r3);
              setR4(data.r4);
              simulatePll();
            },
            error: function (result) {
            }
  });
}

// getters for form values

/*
* read the selectedIndex of the select and return the
* multiplier. For instance, if selected index is 3 (MHz),
* return 10e6.
* @param {id} id of select element
* @return {Number}
*/
function get_frequency_multiplier(idElement) {
  var mult = document.getElementById(idElement).selectedIndex;
  return Math.pow(10,3*mult);
}

/*
* read the selectedIndex of the select and return the
* multiplier. For instance, if selected index is 2 (mA),
* return 10e-3.
* @param {id} id of select element
* @return {Number}
*/
function get_current_multiplier(idElement) {
  var mult = document.getElementById(idElement).selectedIndex;
  return Math.pow(10,-3*mult);
}


// setters for form values

/* set the global value for fc and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setFc(val) {
  pll.fc = val;
  document.getElementById("fc").value = math.unit(pll.fc,"Hz").format(3);
  
}
function getFc () {
  pll.fc = math.unit(document.getElementById("fc").value).value;
}


/* set the global value for kphi and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setKphi(val) {
  pll.kphi = val;
  document.getElementById("kphi").value = math.unit(pll.kphi,"A").toString();
}
function getKphi () {
  pll.kphi = math.unit(document.getElementById("kphi").value).value;
}
/* set the global value for kvco and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setKvco(val) {
  pll.kvco = val;
  document.getElementById("kvco").value = math.unit(pll.kvco,"Hz").toString();
}
function getKvco () {
  pll.kvco = math.unit(document.getElementById("kvco").value).value;
}

/* set the global value for pm and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setPm(val) {
  pll.pm = val;
  document.getElementById("pm").value = math.unit(pll.pm,"deg").format(3);
}
function getPm () {
  pll.pm = (math.unit(document.getElementById("pm").value).value)*180/math.PI;
  
}


/* set the global value for fref and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setFref(val) {
  pll.fref = val;
  document.getElementById("fref").value = math.unit(pll.fref,"Hz").toString();
}
function getFref () {
  pll.fref = math.unit(document.getElementById("fref").value).value;
}


/* set the global value for fout and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setFout(val) {
  pll.fout = val;
  document.getElementById("fout").value = math.unit(pll.fout,"Hz").toString();
}
function getFout() {
  pll.fout = math.unit(document.getElementById("fout").value).value;
}

/* set the global value for fpfd and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setFpfd(val) {
  pll.fpfd = val;
  document.getElementById("fpfd").value = math.unit(pll.fpfd,"Hz").toString();
}
function getFpfd() {
  pll.fpfd = math.unit(document.getElementById("fpfd").value).value;
}
/* set the global value for R and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setR(val) {
  pll.R = val
  document.getElementById("divR").value = val;
}
function getR () {
  pll.R = Number(document.getElementById("divR").value);
}

/* set the global value for N and change the form display
 * this call is only made within program. argument
 * is not checked for validity
 * @param {Number} reference frequency in Hz
 */
function setN(val) {
  pll.N = val
  document.getElementById("divN").value = val;
}
function getN () {
  pll.N = Number(document.getElementById("divN").value);
}

function setT2(val) {
  loop_filter.t2 = val;
  document.getElementById("t2").value = math.unit(loop_filter.t2,"s").format(3);
}

function setT1(val) {
  loop_filter.t1 = val;
  document.getElementById("t1").value = math.unit(loop_filter.t1,"s").format(3);
}

function setC1(val) {
  loop_filter.c1 = val;
  document.getElementById("c1").value = math.unit(loop_filter.c1,"F").format(3);
}

function setC2(val) {
  loop_filter.c2 = val;
  document.getElementById("c2").value = math.unit(loop_filter.c2,"F").format(3);
}

function setC3(val) {
  loop_filter.c3 = val;
  document.getElementById("c3").value = math.unit(loop_filter.c3,"F").format(3);
}

function setC4(val) {
  loop_filter.c4 = val;
  document.getElementById("c4").value = math.unit(loop_filter.c4,"F").format(3);
}

function setR2(val) {
  loop_filter.r2 = val;
  document.getElementById("r2").value = math.unit(loop_filter.r2,"ohm").format(3);
}

function setR3(val) {
  loop_filter.r3 = val;
  document.getElementById("r3").value = math.unit(loop_filter.r3,"ohm").format(3);
}

function setR4(val) {
  loop_filter.r4 = val;
  document.getElementById("r4").value = math.unit(loop_filter.r4,"ohm").format(3);
}

function setA0(val) {
  loop_filter.a0 = val
  var val = val.toExponential(2);
  // document.getElementById("a0").value = val;
}

function setA1(val) {
  loop_filter.a1 = val
  var val = val.toExponential(2);
  // document.getElementById("a1").value = val;
}

function setA2(val) {
  loop_filter.a2 = val
  var val = val.toExponential(2);
  // document.getElementById("a2").value = val;
}

function setA3(val) {
  loop_filter.a3 = val
  var val = val.toExponential(2);
  // document.getElementById("a3").value = val;
}
function setT3(val) {
  loop_filter.t3 = val;
  document.getElementById("t3").value = math.unit(loop_filter.t3,"s").format(3);
}

function setT4(val) {
  loop_filter.t4 = val;
  document.getElementById("t4").value = math.unit(loop_filter.t4,"s").format(3);
}


// form event handlers

/* User changes C1. Resimulate loop.
 * write new value for fc and pm
*/
function onC1Changed() {
  var val_str = document.getElementById("c1").value;
  var val_good = check_unit( val_str, "F", "c1" );
  if (val_good) {
    setC1( math.unit( document.getElementById("c1").value ).value ); 
  } else {
    document.getElementById("c1").value = math.unit(loop_filter.c1,"F").format(3);
    return;
  }

  simulatePll();
}

/* User changes C2. Resimulate loop.
 * write new value for fc and pm
*/
function onC2Changed() {
  var val_str = document.getElementById("c2").value;
  var val_good = check_unit( val_str, "F", "c2" );
  if (val_good) {
    setC2( math.unit( document.getElementById("c2").value ).value ); 
  } else {
    document.getElementById("c2").value = math.unit(loop_filter.c2,"F").format(3);
    return;
  }

  simulatePll();
}

/* User changes C3. Resimulate loop.
 * write new value for fc and pm
*/
function onC3Changed() {
  var val_str = document.getElementById("c3").value;
  var val_good = check_unit( val_str, "F", "c3" );
  if (val_good) {
    setC3( math.unit( document.getElementById("c3").value ).value ); 
  } else {
    document.getElementById("c3").value = math.unit(loop_filter.c3,"F").format(3);
    return;
  }

  simulatePll();

}

/* User changes C4. Resimulate loop.
 * write new value for fc and pm
*/
function onC4Changed() {
  var val_str = document.getElementById("c4").value;
  var val_good = check_unit( val_str, "F", "c4" );
  if (val_good) {
    setC4( math.unit( document.getElementById("c4").value ).value ); 
  } else {
    document.getElementById("c4").value = math.unit(loop_filter.c4,"F").format(3);
    return;
  }

  simulatePll();

}

/* User changes R2. Resimulate loop.
 * write new value for fc and pm
*/
function onR2Changed() {
  var val_str = document.getElementById("r2").value;
  var val_good = check_unit( val_str, "ohm", "r2" );
  if (val_good) {
    setR2( math.unit( document.getElementById("r2").value ).value ); 
  } else {
    document.getElementById("r2").value = math.unit(loop_filter.r2,"ohm").format(3);
    return;
  }

  simulatePll();

}

/* User changes R3. Resimulate loop.
 * write new value for fc and pm
*/
function onR3Changed() {
  var val_str = document.getElementById("r3").value;
  var val_good = check_unit( val_str, "ohm", "r3" );
  if (val_good) {
    setR3( math.unit( document.getElementById("r3").value ).value ); 
  } else {
    document.getElementById("r3").value = math.unit(loop_filter.r3,"ohm").format(3);
    return;
  }

  simulatePll();

}

/* User changes R4. Resimulate loop.
 * write new value for fc and pm
*/
function onR4Changed() {
  var val_str = document.getElementById("r4").value;
  var val_good = check_unit( val_str, "ohm", "r4" );
  if (val_good) {
    setR4( math.unit( document.getElementById("r4").value ).value ); 
  } else {
    document.getElementById("r4").value = math.unit(loop_filter.r4,"ohm").format(3);
    return;
  }

  simulatePll();

}


/* User changes Fref. Calculate new fpfd
 * and new fout
*/
function onFrefChanged() {
  var val_str = document.getElementById("fref").value;
  var val_good = check_unit( val_str, "Hz", "fref" );
  if (val_good) {
    setFref( math.unit( document.getElementById("fref").value ).value ); 
  } else {
    document.getElementById("fref").value = math.unit(pll.fref,"Hz").toString();
    return;
  }

  setFpfd( pll.fref/pll.R );
  setFout( pll.fpfd*pll.N );
  synthPll();
}

/* User changes Fpfd. Calculate new value for R
 * and N and set them both
 */
function onFpfdChanged() {
  var val_str = document.getElementById("fpfd").value;
  var val_good = check_unit( val_str, "Hz", "fpfd" );
  if (val_good) {
    setFpfd( math.unit( document.getElementById("fpfd").value ).value ); 
  } else {
    document.getElementById("fpfd").value = math.unit(pll.fpfd,"Hz").toString();
    return;
  }
  setR( Math.round( pll.fref/pll.fpfd, 0) ); // force integer
  setFpfd( pll.fref/pll.R ); // set fpfd again if original was not integer
  setN(pll.fout/pll.fpfd);

  synthPll();
}

/* User changes N. Calculate new value
 * for fout and set fout
 * */
function onNChanged() {
  pll.N = parseFloat( document.getElementById("divN").value );
  setFout(pll.fpfd*pll.N);

  synthPll();
}

/* User changes Fout. Calculate new value
 * for N and set N
 * */
function onFoutChanged() {
  var val_str = document.getElementById("fout").value;
  var val_good = check_unit( val_str, "Hz", "fout" );
  if (val_good) {
    setFout( math.unit( document.getElementById("fout").value ).value ); 
  } else {
    document.getElementById("fout").value = math.unit(pll.fout,"Hz").toString();
    return;
  }
  setN(pll.fout/pll.fpfd);

  synthPll();
}

/* User changes Kphi. Loop is resynthesized.
 * */
function onKphiChanged() {
  var val_str = document.getElementById("kphi").value;
  var val_good = check_unit( val_str, "A", "kphi" );
  if (val_good) {
    setKphi( math.unit( document.getElementById("kphi").value ).value ); 
  } else {
    document.getElementById("kphi").value = math.unit(pll.kphi,"A").toString();
    return;
  }

  synthPll();
}

/* User changes Kvco. Loop is resynthesized.
 * */
function onKvcoChanged() {
  var val_str = document.getElementById("kvco").value;
  var val_good = check_unit( val_str, "Hz", "kvco" );
  if (val_good) {
    setKvco( math.unit( document.getElementById("kvco").value ).value ); 
  } else {
    document.getElementById("kvco").value = math.unit(pll.kvco,"Hz").toString();
    return;
  }

  synthPll();
}

/* User changes Fc. Loop is resynthesized
 * and then resimulated
 * */
function onFcChanged() {
  var val_str = document.getElementById("fc").value;
  var val_good = check_unit( val_str, "Hz", "fc" );
  if (val_good) {
    setFc( math.unit( document.getElementById("fc").value ).value ); 
  } else {
    document.getElementById("fc").value = math.unit(pll.fc,"Hz").toString();
    return;
  }

  synthPll();
}

/* User changes Pm. Loop is resynthesized 
 * and then resimulated
 * TBD: for some reason the simulation barfs when pm is 90 degrees
 * */
function onPmChanged() {
  var val_str = document.getElementById("pm").value;
  var val_good = check_unit( val_str, "deg", "pm" );
  if (val_good) {
    setPm( math.unit( document.getElementById("pm").value ).toJSON().value ); // without toJSON it will return in radians
  } else {
    document.getElementById("pm").value = math.unit(pll.pm,"deg").toString();
    return;
  }

  synthPll();
}

/* User changes R. Calculate new value for 
 * Fpfd and set Fpfd. Then calculate new Value for N
 * and set N.
 * Leave Fout unchanged.
 * */
function onRChanged() {
  pll.R = parseFloat( document.getElementById("divR").value );
  setFpfd(pll.fref/pll.R);
  setN(pll.fout/pll.fpfd);

  synthPll();
}

/* User changes Pll Figure of Merit. 
 * */
function onFomChanged() {
  pll.fom = parseFloat( document.getElementById("pllFom").value );

  synthPll();
}
function getFom () {
  pll.fom = Number(document.getElementById("pllFom").value);
}


// /* User changes Pll flicker noise changed
//  * */
// function onFlickerChanged() {
//   pll.flicker = parseFloat( document.getElementById("pllFlicker").value );
// 
//   synthPll();
// }
// function getFlicker () {
//   pll.flicker = Number(document.getElementById("pllFlicker").value);
// }

/* checks the value of the user input for proper formatting against
 * the unit. returns true if good.
 * @param {String} or {Number} - value captured from the form input
 * @param {String} - desired unit
 * @param {String} - id tag of input
 * @returns {Boolean}
 */
function check_unit( val, unit, id ) {
  if ( isNaN(val) ) {
    // val is not a number. check if is correctly formatted for unit
    // console.log(math.unit(val));
    try {
      document.getElementById(id).value = math.unit(val).toString();
    }
    catch(err) {
      // not formatted correctly, so return false
      return false;
    }
  } else {
    // val is number so automatically good
    // set field to user-friendly format
    document.getElementById(id).value = math.unit(val,unit).toString();
  }
  return true;
}

/* Phase noise table events
 *
 */
function refTableChangedHandler() {
  // console.log('refTablechangedHandler()');
  var table = document.getElementById("refPnTable");
  // console.log(table);
  for (var r = 1, n = table.rows.length; r < n; r++ ) {
    table.rows[r].cells[0].innerHTML = table.rows[r].cells[0].innerHTML.replace(/[<br>]/gm,"");
    var f_str = table.rows[r].cells[0].innerHTML;
    var val_good = check_valid_table_frequency( f_str, table, r, col=0 );
    if (val_good) {
      refPhaseNoise.freqs[r-1] = math.unit( table.rows[r].cells[0].innerHTML).value;
    } else {
      table.rows[r].cells[0].innerHTML = math.unit(refPhaseNoise.freqs[r-1],"Hz").toString();
    }
    
    // 
    table.rows[r].cells[1].innerHTML = table.rows[r].cells[1].innerHTML.replace(/[<br>]/gm,"");
    var p_str = table.rows[r].cells[1].innerHTML;
    var val_good = check_valid_table_number( p_str, table, r, col=1 );
    if (val_good) {
      refPhaseNoise.pns[r-1] = Number( table.rows[r].cells[1].innerHTML );
    } else {
      table.rows[r].cells[1].innerHTML = refPhaseNoise.pns[r-1].toString();
    }
  }
  graphReferencePhaseNoise(); 
  // simulatePhaseNoise();
}

function vcoTableChangedHandler() {
  var table = document.getElementById("vcoPnTable");
  // console.log(table);
  for (var r = 1, n = table.rows.length; r < n; r++ ) {
    table.rows[r].cells[0].innerHTML = table.rows[r].cells[0].innerHTML.replace(/[<br>]/gm,"");
    var f_str = table.rows[r].cells[0].innerHTML;
    var val_good = check_valid_table_frequency( f_str, table, r, col=0 );
    if (val_good) {
      vcoPhaseNoise.freqs[r-1] = math.unit( table.rows[r].cells[0].innerHTML).value;
    } else {
      table.rows[r].cells[0].innerHTML = math.unit(vcoPhaseNoise.freqs[r-1],"Hz").toString();
    }
    
    // 
    table.rows[r].cells[1].innerHTML = table.rows[r].cells[1].innerHTML.replace(/[<br>]/gm,"");
    var p_str = table.rows[r].cells[1].innerHTML;
    var val_good = check_valid_table_number( p_str, table, r, col=1 );
    if (val_good) {
      vcoPhaseNoise.pns[r-1] = Number( table.rows[r].cells[1].innerHTML );
    } else {
      table.rows[r].cells[1].innerHTML = vcoPhaseNoise.pns[r-1].toString();
    }
  }
  graphVcoPhaseNoise(); 
  // simulatePhaseNoise();
}

function check_valid_table_number( val, table, row, col=1 ) {
  if ( isNaN(val) ) {
    // val is not a number. check if is correctly formatted for unit
    return false;
  } else {
    return true;
  }
}

function check_valid_table_frequency( val, table, row, col=0 ) {
  if ( isNaN(val) ) {
    // val is not a number. check if is correctly formatted for unit
    try {
      // table.rows[row].cells[col].innerHTML = table.rows[row].cells[col].innerHTML.replace(/(\r\n|\n|\r)/gm,"");
      table.rows[row].cells[col].innerHTML = math.unit(val).toString();
    }
    catch(err) {
      // not formatted correctly, so return false
      return false;
    }
  } else {
    // val is number so automatically good
    // set field to user-friendly format
    table.rows[row].cells[col].innerHTML  = math.unit(val,"Hz").toString();
  }
  return true;
}
function readReferencePhaseNoise() {
  var pn =   { freqs:     [],
               pns:       []
             };
  var table = document.getElementById("refPnTable");
  for (var r = 1, n = table.rows.length; r < n; r++ ) {
    pn.freqs.push( math.unit( table.rows[r].cells[0].innerHTML ).value ); 
    var pn_point = Number( table.rows[r].cells[1].innerHTML );
    pn.pns.push( Number(pn_point) );
    }
  return pn;
}

function readVcoPhaseNoise() {
  var pn =   { freqs:     [],
               pns:       []
             };
  var table = document.getElementById("vcoPnTable");
  for (var r = 1, n = table.rows.length; r < n; r++ ) {
    pn.freqs.push( math.unit( table.rows[r].cells[0].innerHTML ).value ); 
    var pn_point = Number( table.rows[r].cells[1].innerHTML );
    pn.pns.push( Number(pn_point) );
    }
  return pn;
}

function checkForEnter( e ) {
  // console.log(e);
  if (e.key == "Enter") {
    refTableChangedHandler();
    $("#refPnTable").focusout;
  }
}

function testFun() {


  my_url = "/pll_app/pll_calcs/callSimulatePhaseNoise?"
  dat = "freqs=" + refPhaseNoise.freqs 
        + "&refPn=" + refPhaseNoise.pns
        + "&vcoPn=" + vcoPhaseNoise.pns
        + "&pllFom=" + pll.fom
        + "&kphi=" + pll.kphi
        + "&kvco=" + pll.kvco
        + "&fpfd=" + pll.fpfd
        + "&N=" + pll.N
        + "&R=" + pll.R
        + "&flt_type=" + loop_filter.type
        + "&c1=" + loop_filter.c1
        + "&c2=" + loop_filter.c2
        + "&r2=" + loop_filter.r2
        + "&c3=" + loop_filter.c3 
        + "&c4=" + loop_filter.c4 
        + "&r3=" + loop_filter.r3 
        + "&r4=" + loop_filter.r4;

  $.ajax( {
            type: "GET",
            url: my_url,
            datatype: 'json',
            async: true,
            data: dat,
            success: function (data) {
              plotPhaseNoise( data.freqs,
                              data.refPnOut,
                              data.vcoPnOut,
                              data.icPnOut,
                              data.compositePn );
              plotPhaseNoise( data.freqs,
                              data.refPnOut,
                              data.vcoPnOut,
                              data.icPnOut,
                              data.compositePn );
              // console.log(data);

            },
            error: function (result) {
            }
  });

}





