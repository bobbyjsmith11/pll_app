#
#-*- coding: utf-8 -*-
# 
# -------------------------------------------------------------------------
# 
# -------------------------------------------------------------------------

from gluon.tools import Service
service = Service(globals())

import numpy as np
# import matplotlib.pylab as plt

def call():
    """
    exposes services. for example:
    http://..../[app]/pll_calcs/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    # session.forget()
    return service()

@service.json
def solveForComponents( ):
    """
    :Parameters:
    loop_type (str) - 
        * passive2 - 2nd order passive
        * passive3 - 3rd order passive
        * passive4 - 4th order passive
        * active2 -  2nd order active
        * active3 -  3rd order active
        * active4 -  4th order active
    fc (float) - 0dB crossover frequency in Hz
    pm (float) - phase margin in degrees
    kphi (float) - charge pump gain in Amps per radian
    kvco (float) - vco tuning sensitivity in Hz/V
    N (int) - loop multiplication ratio
    gamma (float) - optimization factor (1.024 default)
    """
    fc =        float(request.vars.fc)
    pm =        float(request.vars.pm)
    kphi =      float(request.vars.kphi)
    kvco =      float(request.vars.kvco)
    N =         float(request.vars.N)
    gamma =     float(request.vars.gamma)
    loop_type = request.vars.loop_type
    
    if loop_type == 'passive2':
        pll = PllSecondOrderPassive( fc,
                                     pm,
                                     kphi,
                                     kvco,
                                     N,
                                     gamma=gamma )
        d = pll.calc_components()
    elif loop_type == 'passive3':
        pll = PllThirdOrderPassive( fc,
                                    pm,
                                    kphi,
                                    kvco,
                                    N,
                                    gamma=gamma )
        d = pll.calc_components()
    elif loop_type == 'passive4':
        pll = PllFourthOrderPassive( fc,
                                     pm,
                                     kphi,
                                     kvco,
                                     N,
                                     gamma=gamma )
        d = pll.calc_components()
    return response.json(d)

class PllSecondOrderPassive( object ):
    def __init__(self,
                 fc,
                 pm,
                 kphi,
                 kvco,
                 N,
                 gamma=1.024):
        """
        :Parameters:
        fc (float) - cutoff frequency in Hz
        pm (float) - phase margin in degrees
        kphi (float) - charge pump gain in Amps per radian
        kvco (float) - vco tuning sensitivity in Hz/V
        N (int) - loop multiplication ratio
        gamma (float) - optimization factor (default=1.024)
        """
        self.fc = fc
        self.pm = pm
        self.kphi = kphi
        self.kvco = kvco
        self.N = N
        self.gamma = gamma

    def calc_components(self):
        """ return a dict with the component values """
        d = {}

        d['t1'] = self.calc_t1(self.fc, 
                               self.pm, 
                               self.gamma)

        d['t2'] = self.calc_t2(self.fc, 
                               d['t1'], 
                               self.gamma)

        d['a0'] = self.calc_a0(self.kphi, 
                               self.kvco, 
                               self.N, 
                               self.fc, 
                               d['t1'],
                               d['t2'])

        d['c1'] = self.calc_c1(d['a0'],
                               d['t1'],
                               d['t2'])

        d['c2'] = self.calc_c2(d['a0'], 
                               d['c1'])

        d['r2'] = self.calc_r2(d['c2'], 
                               d['t2'])

        d['a1'] = self.calc_a1(d['c1'], 
                               d['c2'],
                               d['r2'])
        d['a2'] = 0 
        d['a3'] = 0 
        d['r3'] = 0
        d['r4'] = 0
        d['c3'] = 0
        d['c4'] = 0
        d['t3'] = 0
        d['t4'] = 0

        return d

    def calc_t1(self, fc, pm, gamma=1.024):
        """
        :Parameters:
        fc (float) - cutoff frequency in Hz
        pm (float) - phase margin in degrees
        gamma (float) - optimization factor (default=1.024)
        """
        omega_c = 2*np.pi*fc
        phi = np.pi*pm/180
        t1 = (np.sqrt(((1+gamma)**2)*(np.tan(phi))**2 + 4*gamma) -\
                (1+gamma)*np.tan(phi)) /\
                (2*omega_c)
        return t1
       
    def calc_t2(self, fc, t1, gamma=1.024):
        """
        :Parameters:
        fc (float) - cutoff frequency in Hz
        t1 (float) - time constant t1 in seconds
        gamma (float) - optimization factor (default=1.024)
        """
        omega_c = 2*np.pi*fc
        return gamma/((omega_c**2)*t1)
    
    def calc_a0(self, kphi, kvco, N, fc, t1, t2):
        """
        :Parameters:
        kphi (float) - charge pump gain in Amps per radian
        kvco (float) - vco tuning sensitivity in Hz/V
        N (int) - loop multiplication ratio
        fc (float) - 0dB crossover frequency in Hz
        t1 (float) - time constant t1 in seconds
        t2 (float) - time constant t2 in seconds
        """
        omega_c = 2*np.pi*fc
        x = (kphi*kvco)/(N*omega_c**2)
        y_num = np.sqrt(1+(omega_c**2)*(t2**2))
        y_den = np.sqrt(1+(omega_c**2)*(t1**2))
        a0 = x*y_num/y_den
        return a0
    
    def calc_c1(self, a0, t1, t2):
        """
        :Parameters:
        a0 (float) - loop filter coefficient
        t1 (float) - time constant t1 in seconds
        (t2 (float) - time constant t2 in seconds
        """
        return a0*t1/t2
    
    def calc_c2(self, a0, c1):
        """
        :Parameters:
        a0 (float) - loop filter coefficient
        c1 (float) - capacitor in Farads
        """
        return a0-c1
    
    def calc_r2(self, c2, t2):
        """
        :Parameters:
        c2 (float) - capacitor in Farads
        t2 (float) - time constant t2 in seconds
        """
        return t2/c2

    def calc_a1(self, c1, c2, r2):
        """
        :Parameters:
        c1 (float) - capacitor in Farads
        c2 (float) - capacitor in Farads
        r2 (float) - resistor in Ohms
        """
        return c1*c2*r2

class PllThirdOrderPassive( PllSecondOrderPassive ):
    def __init__(self,
                 fc,
                 pm,
                 kphi,
                 kvco,
                 N,
                 gamma=1.136,
                 t31=0.6):
        """
        :Parameters:
        fc (float) - cutoff frequency in Hz
        pm (float) - phase margin in degrees
        kphi (float) - charge pump gain in Amps per radian
        kvco (float) - vco tuning sensitivity in Hz/V
        N (int) - loop multiplication ratio
        gamma (float) - optimization factor (default=1.136)
        t31 (float) - ratio of T3 to T1 (default=0.6)
        """
        self.fc = fc
        self.pm = pm
        self.kphi = kphi
        self.kvco = kvco
        self.N = N
        self.gamma = gamma
        self.t31 = t31

    def calc_components(self):
        """ return a dict with the component values """
        d = {}
        omega_c = 2*np.pi*self.fc

        # solve for time constants
        d['t1'] = self.calc_t1(self.fc, 
                               self.pm, 
                               self.gamma)

        d['t3'] = d['t1']*self.t31 
  
        d['t2'] = self.gamma/( (omega_c**2)*(d['t1'] + d['t3'] ) )
        

        # solve for coefficients
        d['a0'] = self.calc_a0(self.kphi, 
                               self.kvco, 
                               self.N, 
                               self.fc, 
                               d['t1'],
                               d['t2'],
                               d['t3'])

        d['a1'] = d['a0']*(d['t1'] + d['t3'])

        d['a2'] = d['a0']*d['t1']*d['t3']


        # solve for components
        d['c1'] = self.calc_c1(d['a0'],
                               d['a1'],
                               d['a2'],
                               d['t2'])

        d['c3'] = self.calc_c3( d['a0'],
                                d['a1'],
                                d['a2'],
                                d['t2'],
                                d['c1'] )

        d['c2'] = d['a0'] - d['c1'] - d['c3']


        d['r2'] = d['t2']/d['c2']

        d['r3'] = d['a2']/(d['c1']*d['c3']*d['t2'])

        d['t4'] = 0
        d['a3'] = 0
        d['r4'] = 0
        d['c4'] = 0

        return d

  
    def calc_c3( self,
                 a0,
                 a1,
                 a2,
                 t2,
                 c1 ):
        return ( -(t2**2)*(c1**2) + t2*a1*c1 - a2*a0 )/( (t2**2)*c1 - a2 )

    def calc_c1( self,
                 a0,
                 a1, 
                 a2, 
                 t2 ):
        return (a2/(t2**2))*(1 + np.sqrt(1 + (t2/a2)*(t2*a0 - a1) ) )
    
    def calc_a0( self, 
                 kphi, 
                 kvco, 
                 N, 
                 fc, 
                 t1, 
                 t2, 
                 t3 ):
        omega_c = 2*np.pi*fc
        k1 = kphi*kvco/((omega_c**2)*(N))
        k2 = np.sqrt( (1+(omega_c*t2)**2)/((1+(omega_c*t1)**2)*(1+(omega_c*t3)**2) ) )
        return k1*k2

    def calc_t1(self, 
                fc, 
                pm, 
                gamma,
                t31=0.6,
                num_iters=100):
        """ numerically solve for t1 using the bisection method
            see: https://en.wikibooks.org/wiki/Numerical_Methods/Equation_Solving
        :Parameters:
        fc (float) - cutoff frequency in Hz
        pm (float) - phase margin in degrees
        gamma (float) - optimization factor (1.136)
        num_iters (int) - number of times to loop
        """
        a = 1e-15   # initial guess for a
        b = 1.0       # initial guess for b
        fa = self.func_t1(a,fc,pm,t31=t31,gamma=gamma)
        fb = self.func_t1(b,fc,pm,t31=t31,gamma=gamma)
        for i in range(num_iters):
            guess = (a+b)/2
            if (self.func_t1(guess,fc,pm,t31=t31,gamma=gamma) < 0):
                b = guess
            else:
                a = guess
        return guess

    def func_t1(self,
                x, 
                fc, 
                pm,
                t31=0.6, 
                gamma=1.136):
        """ simulate t1. This function is used to 
        numerically solve for T1. 
        Equation 22.31 in Dean Banerjee's Book
        :Parameters:
        x (float) - guess at t1
        fc (float) - cutoff frequency in Hz
        pm (float) - phase margin in degrees
        t31 (float) - ratio of t3 to t1
        gamma (float) - optimization factor (1.136)
        :Returns:
        updated value for t1 based on guess (float)
        """
        omega_c = 2*np.pi*fc
        phi = pm*np.pi/180
        val = np.arctan( gamma/(omega_c*x*(1+t31)) ) - \
                np.arctan( omega_c*x ) - \
                np.arctan( omega_c*x*t31 ) - phi
        return val

def test4thComponents():
    fc = 10e3
    pm = 47.8
    gamma = 1.115
    kphi = 4e-3
    kvco = 20e6
    fout = 900e6
    fpfd = 200e3
    N = fout/fpfd
    t31 = 0.4
    t43 = 0.4
    
    pll = PllFourthOrderPassive(fc,
                                pm,
                                kphi,
                                kvco,
                                N,
                                gamma=gamma,
                                t31=t31,
                                t43=t43)
    
    return pll.calc_components()

class PllFourthOrderPassive( PllSecondOrderPassive ):
    def __init__(self,
                 fc,
                 pm,
                 kphi,
                 kvco,
                 N,
                 gamma=1.115,
                 t31=0.4,
                 t43=0.4):
        """
        :Parameters:
        fc (float) - cutoff frequency in Hz
        pm (float) - phase margin in degrees
        kphi (float) - charge pump gain in Amps per radian
        kvco (float) - vco tuning sensitivity in Hz/V
        N (int) - loop multiplication ratio
        gamma (float) - optimization factor (default=1.115)
        t31 (float) - ratio of T3 to T1 (default=0.4)
        t43 (float) - ratio of T4 to T3 (default=0.4)
            note: for a realizable solution, t31 + t43 <= 1
        """
        self.fc = fc
        self.pm = pm
        self.kphi = kphi
        self.kvco = kvco
        self.N = N
        self.gamma = gamma
        self.t31 = t31
        self.t43 = t43

    def calc_components(self):
        """ return a dict with the component values """
        d = {}
        omega_c = 2*np.pi*self.fc

        # solve for time constants
        d['t1'] = self.calc_t1(self.fc, 
                               self.pm, 
                               self.gamma)

        d['t3'] = d['t1']*self.t31 
        d['t4'] = d['t1']*self.t31*self.t43
  
        d['t2'] = self.gamma/( (omega_c**2)*(d['t1'] + d['t3'] + d['t4'] ) )

        # solve for coefficients
        d['a0'] = self.calc_a0(self.kphi, 
                               self.kvco, 
                               self.N, 
                               self.fc, 
                               d['t1'],
                               d['t2'],
                               d['t3'],
                               d['t4'])
    
        d['a1'] = d['a0']*(d['t1'] + d['t3'] + d['t4'])
        d['a2'] = d['a0']*(d['t1']*d['t3'] + d['t1']*d['t4'] + d['t3']*d['t4'])
        d['a3'] = d['a0']*d['t1']*d['t3']*d['t4']

        c1_t3, r3_t3 = self.calc_c1_r3(d['a0'],d['t1'],d['t2'],d['t3'])
        c1_t4, r3_t4 = self.calc_c1_r3(d['a0'],d['t1'],d['t2'],d['t4'])

        d['c1'] = (c1_t3 + c1_t4)/2
        d['r3'] = (r3_t3 + r3_t4)/2

        d['c2'], d['c3'] = self.calc_c2_c3( d['a0'],
                                   d['a1'],
                                   d['a2'],
                                   d['a3'],
                                   d['t2'],
                                   d['r3'],
                                   d['c1'] )
      
        d['c4'] = d['a0']- d['c1']- d['c2'] - d['c3']

        d['r2'] = d['t2']/d['c2']

        d['r4'] = d['a3']/(d['t2']*d['r3']*d['c1']*d['c3']*d['c4'])


        return d

    def calc_c2_c3( self,
                    a0,
                    a1,
                    a2,
                    a3,
                    t2,
                    r3,
                    c1 ):
        k0 = (a2/a3) - 1.0/t2 - 1.0/(c1*r3) - (a0 - c1)*t2*r3*c1/a3
        k1 = a1 - t2*a0 - a3/(t2*r3*c1) - (a0 - c1)*r3*c1
        a = a3/((t2*c1)**2)
        b = t2 + r3*(c1 - a0) + (a3/(t2*c1))*((1.0/t2) - k0)
        c = k1 - (k0*a3)/t2
        c2 = (-b + np.sqrt(b**2 - 4*a*c))/(2*a)
        c3 = (t2*a3*c1)/(r3*(k0*t2*a3*c1 - c2*(a3 - r3*((t2*c1)**2))))
        return c2, c3

    def calc_c1_r3( self,
                    a0,
                    t1,
                    t2,
                    tpole):
        a1_t = a0*(t1+tpole)
        a2_t = a0*t1*tpole

        c1_t = (a2_t/(t2**2))*(1 + np.sqrt(1 + (t2/a2_t)*(t2*a0 - a1_t)) )
        c3_t = (-1*(t2**2)*(c1_t**2) + t2*a1_t*c1_t - a2_t*a0)/((t2**2)*c1_t - a2_t)
        r3_t = a2_t/(c1_t*c3_t*t2)

        return c1_t, r3_t

    def calc_a0( self, 
                 kphi, 
                 kvco, 
                 N, 
                 fc, 
                 t1, 
                 t2, 
                 t3,
                 t4):
        omega_c = 2*np.pi*fc
        k1 = kphi*kvco/((omega_c**2)*(N))
        k2 = np.sqrt(
                (1+(omega_c*t2)**2)/((1+(omega_c*t1)**2)*(1+(omega_c*t3)**2)*(1+(omega_c*t4)**2) ) 
                    )
        return k1*k2

    def calc_t1(self, 
                fc, 
                pm, 
                gamma,
                t31=0.4,
                t43=0.4,
                num_iters=100):
        """ numerically solve for t1 using the bisection method
            see: https://en.wikibooks.org/wiki/Numerical_Methods/Equation_Solving
        :Parameters:
        fc (float) - cutoff frequency in Hz
        pm (float) - phase margin in degrees
        gamma (float) - optimization factor (1.136)
        num_iters (int) - number of times to loop
        """
        a = 1e-15   # initial guess for a
        b = 1.0       # initial guess for b
        fa = self.func_t1(a,fc,pm,t31=t31,gamma=gamma)
        fb = self.func_t1(b,fc,pm,t31=t31,gamma=gamma)
        for i in range(num_iters):
            guess = (a+b)/2
            if (self.func_t1(guess,fc,pm,t31=t31,gamma=gamma) < 0):
                b = guess
            else:
                a = guess
        return guess

    def func_t1(self,
                x, 
                fc, 
                pm,
                t31=0.4, 
                t43=0.4, 
                gamma=1.136):
        """ simulate t1. This function is used to 
        numerically solve for T1. 
        Equation 22.31 in Dean Banerjee's Book
        :Parameters:
        x (float) - guess at t1
        fc (float) - cutoff frequency in Hz
        pm (float) - phase margin in degrees
        t31 (float) - ratio of t3 to t1
        gamma (float) - optimization factor (1.136)
        :Returns:
        updated value for t1 based on guess (float)
        """
        omega_c = 2*np.pi*fc
        phi = pm*np.pi/180
        val = np.arctan( gamma/(omega_c*x*(1+t31)) ) - \
                np.arctan( omega_c*x ) - \
                np.arctan( omega_c*x*t31 ) -\
                np.arctan( omega_c*x*t31*t43 ) - phi
        return val

@service.json
def callSimulatePllOpenLoop():
    """
    """
    fstart =        float(request.vars.fstart)
    fstop =         float(request.vars.fstop)
    ptsPerDec =     int(request.vars.ptsPerDec)
    kphi =          float(request.vars.kphi)
    kvco =          float(request.vars.kvco)
    N =             float(request.vars.N)
    flt_type =      request.vars.flt_type
    c1 =            float(request.vars.c1)
    c2 =            float(request.vars.c2)
    c3 =            float(request.vars.c3)
    c4 =            float(request.vars.c4)
    r2 =            float(request.vars.r2)
    r3 =            float(request.vars.r3)
    r4 =            float(request.vars.r4)
    flt =   {
            'c1':c1,
            'c2':c2,
            'c3':c3,
            'c4':c4,
            'r2':r2,
            'r3':r3,
            'r4':r4,
            'flt_type':flt_type
            }
    # d = flt 
    f, g, p, fz, pz = simulatePllOpenLoop( fstart,
                                   fstop,
                                   ptsPerDec,
                                   kphi,
                                   kvco,
                                   N,
                                   filt=flt )
    
    d = { 'freqs':f,
          'gains':g,
          'phases':p,
          'fzero': fz,
          'pzero': pz,
        }
    return response.json(d)

def testSimulateOpenLoop():
    fstart = 10
    fstop = 100e6
    ptsPerDec = 100
    kphi = 1e-3
    kvco = 60e6
    N = 39200
    flt = {
            'c1':52.4e-12,
            'c2':1.03e-9,
            'c3':10.9e-12,
            'c4':6.34e-12,
            'r2':47.8e3,
            'r3':111e3,
            'r4':279e3,
            'flt_type':"passive" 
           }
    f,g,p,fz,pz = simulatePllOpenLoop( fstart, 
                         fstop, 
                         ptsPerDec,
                         kphi,
                         kvco,
                         N,
                         filt=flt)

    return f, g, p, fz, pz

def getInterpolatedFzeroPzer( f, g, p ):
    """ look at the points of f, g and p surrounding where
    g crosses zero and interpolate f and p at 0
    """
    ndx = getIndexZeroDbCrossover( g )
    f_zero_db = None 
    g_zero_db = None 
    p_zero_db = None 
    if ndx != None:
        f_zero_db = f[ndx]
        g_zero_db = g[ndx]
        p_zero_db = p[ndx]
    
    newf = f[ndx-1:ndx+1]
    newp = p[ndx-1:ndx+1]
    newg = g[ndx-1:ndx+1]
    mg = (newg[1] - newg[0])/(newf[1] - newf[0])
    mp = (newp[1] - newp[0])/(newf[1] - newf[0])
    
    fz = newf[0] - (newg[0]/mg)
    deltaf = fz - newf[0]   # distance from newf[0] to 0db crossover
    pz = mp*deltaf + newp[0]
    return fz, pz

def getIndexZeroDbCrossover( g ):
    for i in range(len(g)):
        if g[i] <= 0:
            return i
    return None

def simulatePllOpenLoop( fstart, 
                         fstop, 
                         ptsPerDec,
                         kphi,
                         kvco,
                         N,
                         filt=None,
                         coeffs=None):
    """ simulate an arbitrary phase-locked loop using either
    filter coefficients or component values. return 3 lists:
    f (frequencies), g_ol (open-loop gain), phases (open-loop phases)  
    """
    f = freqPointsPerDecade( fstart, fstop, ptsPerDec )
    if coeffs == None:
        c1 = filt['c1']
        c2 = filt['c2']
        r2 = filt['r2']
        if 'r3' not in filt.keys():
            r3 = 0
            c3 = 0
        else:
            c3 = filt['c3']
            r3 = filt['r3']

        if 'r4' not in filt.keys():
            r4 = 0
            c4 = 0
        else:
            c4 = filt['c4']
            r4 = filt['r4']

        coeffs = calculateCoefficients( c1=c1,
                                        c2=c2,
                                        c3=c3,
                                        c4=c4,
                                        r2=r2,
                                        r3=r3,
                                        r4=r4,
                                        flt_type=filt['flt_type'])
    a = coeffs
    t2 = filt['r2']*filt['c2']
    if len(a) == 2:
        # 2nd order
        a.append(0)    
        a.append(0)    
    elif len(a) == 3:
        # 3rd order
        a.append(0)    
    else:
        pass
    # complex frequency variable
    s = np.array(f)*2*np.pi*1j 
    # loop filter impedance
    z = (1 + s*t2)/(s*(a[3]*s**3 + a[2]*s**2 + a[1]*s + a[0])) 
    # G(s)
    g = kphi*kvco*z/s
    # # Open-loop gain 
    g_ol = g/N
    g_ol_db = 10*np.log10(np.absolute(g_ol))
    ph_ol = 180 + np.unwrap(np.angle(g_ol))*180/np.pi
    # ph_ol = 180 + np.angle(g_ol)*180/np.pi

    # convert gains and phases to lists
    # cannot return numpy array to javascript
    g = []
    p = []
    g.extend(g_ol_db)
    p.extend(ph_ol)
    fz, pz = getInterpolatedFzeroPzer( f, g, p )
    return f, g, p, fz, pz

def calculateCoefficients( c1=0, 
                           c2=0, 
                           c3=0, 
                           c4=0,
                           r2=0,
                           r3=0,
                           r4=0,
                           flt_type='passive'):
    """ return loop filter coeffiencients
    """
    a = []
    if flt_type == 'passive':
        a.append( c1 + c2 + c3 + c4 )
        a.append( c2*r2*(c1 + c3 + c4) + r3*(c1 + c2)*(c3 + c4) +\
                  c4*r4*(c1 + c2 + c3) )
        a.append( c1*c2*r2*r3*(c3 + c4) +\
                  c4*r4*(c2*c3*r3 + c1*c3*r3 + c1*c2*r2 + c2*c3*r2) )
    else:
        a.append(c1 + c2)
        a.append( (c1*c2*r2) + (c1 + c2) * (c3*r3 + c4*r4 + c4*r3) )
        a.append( c3*c4*r3*r4 * (c1 + c2) + c1*c2*r2*(c3*r3 + c4*r4 + c4*r3) )
    a.append(c1*c2*c3*c4*r2*r3*r4)
    return a

def calculateZ( f,
                t2,
                a0,
                a1,
                a2=0,
                a3=0):
    """ given the filter coefficients, return Z(s)
    """
    s = np.array(f)*2*np.pi*1j
    z = (1 + s*t2)/(s*(a[3]*s**3 + a[2]*s**2 + a[1]*s + a[0]))
    return z

def calculateG(f, z, kphi, kvco):
    """ given the loop filter impedance, kphi and kvco, return G(s)
    """
    s = np.array(f)*2*np.pi*1j
    g = kphi*kvco*z/s
    return g

def freqPointsPerDecade( fstart, fstop, ptsPerDec ):
    """ return an array of frequencies starting at the 
        nearest decade of 10 from fstart and ending at the 
        nearest decade of 10 at fstop. Each decade has
        ptsPerDec tpoints.
    :Arguments:
    fstart (float)
    fstop (float)
    ptsPerDec (int)
    """
    fstart = float(fstart)
    fstop = float(fstop)
    ptsPerDec = int(ptsPerDec)
    num_decades = round(np.log10(fstop/fstart)/np.log10(10),0)
    ar = []
    istart = int(np.log10(fstart)/np.log10(10))
    ar.append(10**istart)
    for i in range(istart,int(num_decades)+1):
        newDec = 10**i
        nextDec = 10**(i+1)
        inc = float((nextDec - newDec))/float(ptsPerDec)
        for j in range(1,ptsPerDec+1):
            val = newDec + j*inc
            ar.append(val)
    return ar    

def semilogXInterpolate( f, x, y ):
    """ 
    :Returns:
    list
    """
    logx = []
    for i in range(len(x)):
        logx.append(np.log10(x[i]))
    logf = []
    for i in range(len(f)):
        logf.append(np.log10(f[i]))

    pn = np.interp(logf, logx, y)
    lst = []
    lst.extend(pn)
    return lst 

@service.json
def callGetInterpolatedPhaseNoise():
    """
    """
    fstart =        float(request.vars.fstart)
    fstop =         float(request.vars.fstop)
    ptsPerDec =     int(request.vars.ptsPerDec)
    freq_pts =      request.vars.freqs
    pn_pts =        request.vars.pns

    print(fstart)
    print(fstop)
    print(ptsPerDec)
    print(freq_pts)
    print(pn_pts)

    freq_pts = map(float, freq_pts.split(','))
    print(freq_pts)
    pn_pts = map(float, pn_pts.split(','))
    print(pn_pts)
    f = freqPointsPerDecade( fstart, fstop, ptsPerDec )
    pns = semilogXInterpolate(f, freq_pts, pn_pts)
    # f, g, p, fz, pz = simulatePllOpenLoop( fstart,
    #                                fstop,
    #                                ptsPerDec,
    #                                kphi,
    #                                kvco,
    #                                N,
    #                                filt=flt )
    # 
    d = { 'freqs':f,
          'pns':pns,
        }

    # d = { 'freqs':f,
    #       'pns':pns,
    #     }

    return response.json(d)



