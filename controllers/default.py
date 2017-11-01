#
#-*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------
import matplotlib
matplotlib.use('agg')
import os
import s_plot
import skrf 
import cStringIO

def download():
    return response.download(request,db)

def link():
    return response.download(request,db,attachment=False)

def index():
    """
    example action using the internationalization operator T and flash
    rendered by views/default/index.html or views/generic.html

    if you need a simple wiki simply replace the two lines below with:
    return auth.wiki()
    """
    redirect(URL('pll_designer'))
    return dict()

def pll_designer():
    return dict()

def test_file_upload():
    # ts_form = FORM(
    #                 INPUT(_name='touchstone_title', _type='text'),
    #                 INPUT(_name='touchstone_file', _type='file')
    #               )

    ts_form = FORM(
        INPUT(_name='file_form',_type='hidden', _value="file_form"),
        TABLE(TR(TH('Upload new file')),
        TR(TD(INPUT(_class='upload', _name='_file', _type='file' ))),
        TR(TD(INPUT(_type='submit', _value='Upload') )) ))
    if ts_form.accepts(request.vars, session, formname='ts_file'):
        print("ts_form.vars._file.__dict__ = " + str(ts_form.vars._file.__dict__))
    else:
        print("form.errors = " + str(ts_form.errors))


    return dict(form=ts_form)

def s_plotter():
    
    ## using the serialized Web2py version of the form - this at least uploads the file
    file_data=""
    form = SQLFORM.factory(db.s_plot_form)
        
    if form.validate():
        pass 
        response.flash = 'form accepted'
        filepath = os.path.join(request.folder, 'uploads', form.vars.ts_file)

        file_list = db(db.s_plot_form)
        ftemp = open( filepath, 'rb')
        file_data = ftemp.read()
        os.remove( filepath )

    elif form.errors:
        response.flash = 'form has errors'
    else:
        response.flash = 'please fill in form'
    return dict(form=form, file_data=file_data)


@service.json
def load_s2p( ):
    """
    """
    # file_name = request.vars.file_name.strip()
    data = request.vars.file_data
    data = data.replace("'","").strip()

    # skrf needs the correct file extension
    ext = ".s1p"
    for i in range(10):     # supports up to 10 port network
        if "S" + str(i) + "1" in data:
            ext = ".s" +str(i) + "p"
    fname = "temp_file" + ext
    fo = open(fname, "wb")
    fo.write( data)
    fo.close()
    n = skrf.Network( fname )   # pass in the file you just created
    os.remove( fname )          # delete this file
    d = { 'f':                  n.f.tolist(),
          'number_of_ports':    int(n.number_of_ports)
          }
    
    for j in range(n.number_of_ports):      # j is second port
        for k in range(n.number_of_ports):  # k is first port
            tmp = []
            d["s"+str(j+1)+str(k+1)+"db"] = n.s_db[:,j,k].tolist()
    return response.json(d)

def echo():
    print(request.vars.name)
    return request.vars.name

def blog_home():
    return {}

def about_home():
    return dict()

def test_page():
    return {}

def display_form():
    return dict() 

def pll2_passive():
    return dict() 

def test_fun():
    return {'this is a test'}

def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/bulk_register
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    also notice there is http://..../[app]/appadmin/manage/auth to allow administrator to manage users
    """
    return dict(form=auth())


@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()


