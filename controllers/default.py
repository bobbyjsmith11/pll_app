#
#-*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------

import os
import uuid
import s_plot
import skrf 

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
        # print('request.vars = ' + str(request.vars))
        # session.touchstone_file = ts_form.vars.file_form
        # print('session = ' + str(session))
        # print('ts_form.vars.file = ' + str(ts_form.vars.file))
        # print('ts_form.vars.keys() = ' + str(ts_form.vars.keys()))
        #
        #  these next two lines reference the same thing
        # print('ts_form.vars["_file"] = ' + str(ts_form.vars['_file']))
        # session.touchstone_file = "test variable" 
        
        
        # # temp_file.close()
        # print("temp_file.tell() = " + str(temp_file.tell()) )
        # print("temp_file.name = " + str(temp_file.name) )
        # session.touchstone_file = ts_form.vars._file.file

        # print('request.vars["_file"] = ' + str(request.vars["_file"]) )
        print("ts_form.vars._file.__dict__ = " + str(ts_form.vars._file.__dict__))
        # print("ts_form.vars.file.value = " + str(ts_form.vars.file.value))
        # print("ts_form.vars._file = " + str(ts_form.vars._file))
        # # fo.write( ts_form.vars.file )
        # # fo.close()
        # print("ts_form.vars._file.filename = " + str(ts_form.vars._file.filename))
        # print("ts_form.vars._file.file = " + str(ts_form.vars._file.file))

        # fo = open( ts_form.vars["_file"], 'r' )
        # print( "type(fo) = " + str(type(fo)))
        # session.touchstone_file = ts_form.vars["_file"]
        # print('session.touchstone_file = ' + str(session.touchstone_file) )
        
    else:
        print("form.errors = " + str(ts_form.errors))


    return dict(form=ts_form)

def s_plotter():
    
    # form=SQLFORM(db.touchstone_file)
    # if form.process(session=None, formname='ts_form').accepted:
    #     response.flash = 'form accepted'
    #     filepath = os.path.join(request.folder, 'uploads', form.vars.ts_file)
    #     return dict( ts_form.var.ts_file )
    # elif form.errors:
    #     response.flash = 'form has errors'
    # else:
    #     response.flash = 'please fill in the form'

    # 
    # return dict() 

    # file_form = FORM(
    #             INPUT(_name='file_form', _type='hidden', _value='file_form'),
    #             TABLE(TR(TH('upload s-parameters file')),
    #                 TR(TD(INPUT(_class='upload', _name='file', _type='file'))),
    #                 TR(TD(INPUT(_type='submit', _value='upload') )) ))
  
    # file_data = ""
    # if file_form.accepts(request.vars, session, formname='file_form'):
    #     # print("type(request.vars) = " + str(type(request.vars)) )
    #     # print("request.vars.keys() = " + str(request.vars.keys()) )
    #     # print("request.vars['file'].file = " + str(request.vars['file'].file) )
    #     file_data =  request.vars['file'].file.read()
    #     

    # return dict(form=file_form, file_data=file_data)
    #
    #
    ## using the serialized Web2py version of the form - this at least uploads the file
    file_name=None
    file_data=None
    form = SQLFORM(db.s_plot_form)
    if form.validate():
        file_id =  form.vars.id
        response.flash = 'form accepted'
        filepath = os.path.join(request.folder, 'uploads', form.vars.ts_file)
        file_name = form.vars.ts_file.strip()
        db.s_plot_form.insert( ts_file=form.vars.ts_file,
                               storage_path=filepath,
                               file_name=file_name,
                               description=form.vars.description
                               )

        file_list = db(db.s_plot_form)
        session.file_name = file_name
        session.storage_path = filepath
        session.file_id = file_id
        file_data = open( session.storage_path, 'rb').read()
        # file_data = form.vars.ts_file 

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
    # print( data )
    #
    n = skrf.Network( session.storage_path )
    freq = []
    freq.extend(n.f)
    d = { 'f': freq }

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


