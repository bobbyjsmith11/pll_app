#
#-*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------
import mytest
import s_plot

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

    image_form = FORM(
            INPUT(_name='image_title',_type='text'),
            INPUT(_name='image_file',_type='file')
            )

    if image_form.accepts(request.vars, formname='image_form'):

        image = db.image.ifile.store(image_form.vars.image_file.file, image_form.vars.image_file.filename)
        id = db.image.insert(ifile=image,title=image_form.vars.image_title)

    images = db().select(db.image.ALL)

    return dict(images=images)

def pll_designer():
    return dict()

def s_plotter():
     
    # form = SQLFORM(db.s_plot)
    # if form.process().accepted:
    #     response.flash = 'form accepted'
    #     print(form.vars.ts_file)
    #     s = s_plot.get_db_angle( form.vars.ts_file )
    #     print(s)
    # elif form.errors:
    #     response.flash = 'form has errors'
    # return dict(form=form)

    # if form.process(session=None, formname='touchstone_load').accepted:
    #     response.flash = 'form accepted'
    # elif form.errors:
    #     response.flash = 'form has errors'
    # else:
    #     response.flash = 'please fill the form'
    # # Note: no form instance is passed to the view
    # return dict()    
 
    # form = SQLFORM(db.person)
    # if form.process(session=None, formname='test').accepted:
    #     response.flash = 'form accepted'
    # elif form.errors:
    #     response.flash = 'form has errors'
    # else:
    #     response.flash = 'please fill in the form'
    # return dict()

    # form=SQLFORM.factory(
    #         Field('ts_file', 'upload', requires=[IS_NOT_EMPTY(),IS_UPLOAD_FILENAME(extension="s2p")]))
    # if form.process().accepted:
    #     response.flash = 'form accepted'
    #     session.ts_file = form.vars.ts_file
    #     print('session.ts_file = ' + str(session.ts_file))
    #     # s = s_plot.get_db_angle( form.vars.ts_file )
    # elif form.errors:
    #     response.flash = 'form has errors'
    # return dict(form=form)

    # form = SQLFORM(db.person)
    form = SQLFORM(db.s_plot)
    if form.accepts(request.vars, session, form_name='s_plot'):
        response.flash = 'form accepted'
        print('type(request.vars.ts_file) = ' + str(type(request.vars.ts_file)))
        print('request.vars.ts_file__clas__ = ' + str(request.vars.ts_file.__class__))
        print('request.vars.ts_file.filename = ' + str(request.vars.ts_file.filename))
        print('request.vars.ts_file.file = ' + str(request.vars.ts_file.file))
        session.file = request.vars.ts_file.file
        print('session.file = ' + str(session.file))
        # d = s_plot.get_db_angle( session.file )
        # print(d)
    elif form.errors:
        response.flash = 'form has errors'
    else:
        response.flash = 'please fill in the form'
     
    return dict(form=form)

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


