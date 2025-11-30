import app

def test_add_task():
    result = app.add_task().json
    assert "message" in result

def test_get_tasks():
    result = app.get_tasks().json
    assert type(result) == list
