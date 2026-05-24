# controller/accountController.py
from flask import render_template

def list_accounts_get():
    return render_template(
        "pages/list-account.html",
        active_menu="account",
        active_page="list-accounts"
    )

def edit_account_get(account_id):
    return render_template(
        "pages/edit-account.html",
        account_id=account_id,
        active_page="list-account"
    )

def add_account_get():
    return render_template(
        "pages/list-account_add.html",
        account_id="account",
        active_page="list-account"
    )