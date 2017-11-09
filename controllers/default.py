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
    # redirect(URL('pll_designer'))
    return dict()

def pll_designer():
    return dict()

def test_file_upload():

    touchstone_form = FORM(
                        INPUT(_name='touchstone_file', _type='file'),
                        INPUT(_name='submitBtn', _type='submit'),
                            )

    # touchstone_form = FORM(TABLE(TR(TH(INPUT(_name='touchstone_file', _type='file', _class="upload-btn", _value="browse"))),
    #                             TR(TH(INPUT(_name='submitBtn', _type='submit', _value='upload')))))

    file_data = "upload touchstone file to plot"
    if touchstone_form.accepts(request, session):
        file_data = ("request.vars = " + str(request.vars))
    else:
        file_data = ("touchstone_form did not accept\nrequest.vars = " + str(request.vars))

    return dict(form=touchstone_form, file_data=file_data)
    
    # if ts_form.validate():
    #     response.flash = 'form accepted'
    #     print("ts_form.vars._file = " + str(ts_form.vars._file))

    # elif ts_form.errors:
    #     session.file_data = ""
    #     response.flash = 'form has errors'
    # else:
    #     response.flash = 'please fill in form'
    # return dict(form=ts_form, file_data=session.file_data)


def s_plotter():
    
    ## using the serialized Web2py version of the form - this at least uploads the file
    file_data=""
    form = SQLFORM.factory(db.s_plot_form)
    # session.clear()
    if form.validate():
        pass 
        response.flash = 'form accepted'
        filepath = os.path.join(request.folder, 'uploads', form.vars.ts_file)

        file_list = db(db.s_plot_form)
        ftemp = open( filepath, 'rb')
        file_data = ftemp.read()
        ftemp.close()

        try:
            session.network = skrf.Network( filepath )   # pass in the file you just created
            session.file_data = file_data
        except Exception as e:
            session.file_data = ""
            print(e)
        # print("session.network = " + str(session.network))
        os.remove( filepath )

    elif form.errors:
        session.file_data = ""
        response.flash = 'form has errors'
    else:
        response.flash = 'please fill in form'
    return dict(form=form, file_data=session.file_data)


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


