try:
    from backend import app
except Exception:
    import app
import pytest


@pytest.fixture
def client():
    return app.test_client()


def test_add_task(client):
    rv = client.post('/tasks', json={'title': 'Test Task'})
    assert rv.status_code in (200, 201)
    data = rv.get_json()
    assert data and 'message' in data


def test_get_tasks(client):
    rv = client.get('/tasks')
    assert rv.status_code == 200
    data = rv.get_json()
    assert isinstance(data, list)
