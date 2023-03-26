export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`

    return fetch(endpoint)
    .then(data => data.json())
    .then(({ login, name, public_repos, followers }) => ({
      login,
      name,
      public_repos,
      followers
    }))
  }
}

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)

    this.load()

    this.onadd()

  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@gitfav:")) ?? []

    // if (this.entries.length ==) {
    //   console.log('empty-table')
    // }
  }

  save() {
    localStorage.setItem("@gitfav:", JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error('Usuário já existente.')
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error('Usuário não encontrado.')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

//dados
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
  }

  onadd() {
    const addButton = document.querySelector('.search button')

    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    }
  }

  update() {
    this.deleteAllTr()

    if(this.entries.length === 0) {
      document.querySelector('.empty-table').classList.remove('hide')
    } else {
      document.querySelector('.empty-table').classList.add('hide')
    }


    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.login}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user a span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar?')

        if(isOk) {
          this.delete(user)
        }
      }
      
      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/maykbrito.png" alt="Imagem de Mayk Brito">
        <a href="https://github.com/maykbrito">
          <p>Mayk Brito</p>
          <span>/maykbrito</span>
        </a>
      </td>
      <td class="repositories">
        123
      </td>
      <td class="followers">
        1234
      </td>
      <td class="action">
        <button class="remove">Remove</button>
      </td>
    `

    return tr
  }

  deleteAllTr() {
    this.tbody.querySelectorAll('tr')
    .forEach((tr) => {
      tr.remove()
    })
  }
}