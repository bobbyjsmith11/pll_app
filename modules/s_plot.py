#
#-*- coding: utf-8 -*-
# 
# -------------------------------------------------------------------------
# 
# -------------------------------------------------------------------------

from gluon.tools import Service
service = Service(globals())

import numpy as np
import skrf as rf

def call():
    """
    exposes services. for example:
    http://..../[app]/s_plot/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    # session.forget()
    return service()

@service.json
def load_s2p( ):
    """
    """
    f =        str(request.vars.file)
    # n = rf.Network(f)
    print('type(f) = ' + str(type(f)))
    # print('f.name = ' + str(f.name))
    print('f = ' + str(f))
    # print(f)
    # print(type(f))
    d = { 'f': f };
    return response.json(d)

@service.json
def get_db_angle( s2p_file ):
    """
    return the db angle values for the s2p file
    """
    # print('s2p_file = ' + str(s2p_file))
    n = rf.Network(s2p_file)
    # print(n.f)
    f = []
    f.extend(n.f)
    print('type(f) = ' + str(type(f)))
    d = { 'f': f }
    # print(d)
    # return response.json(d) 
    return d

