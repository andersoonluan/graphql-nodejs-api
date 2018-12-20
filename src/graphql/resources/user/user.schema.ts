const userTypes = `

    # User definition type
    type User {
        id: ID!
        cpf: String!
        name: String!
        email: String!
        photo: String
        phone: String
        gender: String
        createdAt: String!
        updatedAt: String!
        posts(first: Int, offset:Int): [ Post! ]!
    }

    input UserCreateInput {
        cpf: String!
        name: String!
        email: String!
        password: String!
    }

    input UserUpdateInput {
        cpf: String
        name: String!
        email: String!
        photo: String!
        gender: String!
        phone: String!
    }

    input UserUpdatePasswordInput {
        password: String!
    }
`;

const userQueries = `
    users(first: Int, offset: Int): [ User! ]!
    user(id: ID!) : User
    currentUser: User
`;

const userMutations = `
    createUser(input: UserCreateInput!) : User
    updateUser(input: UserUpdateInput!) : User
    updateUserPassword(input: UserUpdatePasswordInput) : Boolean
    deleteUser : Boolean
`;

export {
    userTypes,
    userQueries,
    userMutations
}