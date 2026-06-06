import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var email = ""
    @State private var phone = ""
    @State private var password = ""
    @State private var usePhone = false
    @State private var isRegistering = false
    @State private var firstName = ""
    @State private var lastName = ""

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            VStack(spacing: 8) {
                Image(systemName: "person.crop.circle.fill")
                    .font(.system(size: 64))
                    .foregroundStyle(.linearGradient(
                        colors: [.blue, .purple],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))

                Text("Dr. Costi AR")
                    .font(.largeTitle.bold())

                Text("Medical Consultation Avatar")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            VStack(spacing: 16) {
                Picker("Login method", selection: $usePhone) {
                    Text("Email").tag(false)
                    Text("Phone").tag(true)
                }
                .pickerStyle(.segmented)

                if usePhone {
                    TextField("Phone number", text: $phone)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.phonePad)
                } else {
                    TextField("Email", text: $email)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                }

                SecureField("Password", text: $password)
                    .textFieldStyle(.roundedBorder)

                if isRegistering {
                    TextField("First name", text: $firstName)
                        .textFieldStyle(.roundedBorder)
                    TextField("Last name", text: $lastName)
                        .textFieldStyle(.roundedBorder)
                }

                if let error = authViewModel.error {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                }

                Button {
                    Task {
                        if isRegistering {
                            await authViewModel.register(
                                email: usePhone ? nil : email,
                                phone: usePhone ? phone : nil,
                                password: password,
                                firstName: firstName,
                                lastName: lastName
                            )
                        } else {
                            await authViewModel.login(
                                email: usePhone ? nil : email,
                                phone: usePhone ? phone : nil,
                                password: password
                            )
                        }
                    }
                } label: {
                    if authViewModel.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                    } else {
                        Text(isRegistering ? "Create Account" : "Log In")
                            .frame(maxWidth: .infinity)
                    }
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .disabled(authViewModel.isLoading || password.isEmpty)

                Button(isRegistering ? "Already have an account? Log in" : "New patient? Register") {
                    isRegistering.toggle()
                }
                .font(.footnote)
            }
            .padding(.horizontal)

            Spacer()
        }
        .padding()
    }
}
