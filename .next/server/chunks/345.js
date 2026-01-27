"use strict";exports.id=345,exports.ids=[345],exports.modules={8345:(e,t,i)=>{i.d(t,{BP:()=>C,Cf:()=>I,E0:()=>_,ER:()=>$,GB:()=>U,JT:()=>M,KB:()=>L,LL:()=>ee,Ld:()=>c,OT:()=>W,P$:()=>B,UE:()=>er,VP:()=>F,YA:()=>s,Ym:()=>Y,ZS:()=>ei,_b:()=>p,hF:()=>b,is:()=>A,jU:()=>O,kD:()=>h,rz:()=>J,tt:()=>w,vv:()=>f,y5:()=>Q,yj:()=>T});var n=i(4293),r=i(8753),a=i(9167);let o={},u=((0,n.Ps)`
    mutation Signup($input: SignupInput!) {
  signup(input: $input) {
    success
    message
    tempToken
    expiresIn
    userId
    email
    phone
  }
}
    `,(0,n.Ps)`
    mutation VerifyOtp($input: VerifyOtpInput!) {
  verifyOtp(input: $input) {
    accessToken
    refreshToken
    expiresIn
    user {
      id
      name
      email
      phone
      role
      status
      emailVerified
      phoneVerified
      permissions
    }
  }
}
    `,(0,n.Ps)`
    mutation ResendOtp($tempToken: String!) {
  resendOtp(tempToken: $tempToken) {
    success
    message
    tempToken
    expiresIn
    userId
    email
    phone
  }
}
    `,(0,n.Ps)`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    refreshToken
    expiresIn
    user {
      id
      name
      email
      phone
      role
      status
      emailVerified
      phoneVerified
      permissions
    }
  }
}
    `);function s(e){let t={...o,...e};return r.D(u,t)}(0,n.Ps)`
    mutation RefreshToken($input: RefreshTokenInput!) {
  refreshToken(input: $input) {
    accessToken
    refreshToken
    expiresIn
    user {
      id
      name
      email
      phone
      role
      status
    }
  }
}
    `,(0,n.Ps)`
    mutation Logout {
  logout
}
    `;let d=(0,n.Ps)`
    mutation SendOtp($email: String, $phone: String) {
  sendOtp(email: $email, phone: $phone) {
    success
    message
    expiresIn
  }
}
    `;function p(e){let t={...o,...e};return r.D(d,t)}(0,n.Ps)`
    mutation ForgotPassword($input: ForgotPasswordInput!) {
  forgotPassword(input: $input) {
    success
    message
  }
}
    `,(0,n.Ps)`
    mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input)
}
    `,(0,n.Ps)`
    mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input)
}
    `;let l=(0,n.Ps)`
    mutation SubmitContact($input: ContactInput!) {
  submitContact(input: $input) {
    id
    name
    email
    phone
    subject
    message
    createdAt
  }
}
    `;function c(e){let t={...o,...e};return r.D(l,t)}let m=(0,n.Ps)`
    mutation CreateDocument($input: CreateDocumentInput!) {
  createDocument(input: $input) {
    id
    userId
    templateId
    title
    category
    status
    formData
    completionPercentage
    currentStep
    createdAt
    updatedAt
  }
}
    `;function f(e){let t={...o,...e};return r.D(m,t)}(0,n.Ps)`
    mutation SaveDraft($documentId: String!) {
  saveDraft(documentId: $documentId) {
    id
    userId
    templateId
    title
    status
    formData
    currentStep
    updatedAt
  }
}
    `,(0,n.Ps)`
    mutation DeleteDraft($documentId: String!) {
  deleteDraft(documentId: $documentId)
}
    `;let y=(0,n.Ps)`
    mutation SubmitNotaryApplication($input: NotaryApplicationInput!) {
  submitNotaryApplication(input: $input) {
    id
    applicationNumber
    userId
    firstName
    middleName
    lastName
    email
    phone
    status
    appliedAt
  }
}
    `;function $(e){let t={...o,...e};return r.D(y,t)}let g=(0,n.Ps)`
    mutation ApproveNotaryApplication($applicationId: String!) {
  approveNotaryApplication(applicationId: $applicationId) {
    id
    applicationNumber
    firstName
    middleName
    lastName
    email
    phone
    status
    appliedAt
    reviewedAt
  }
}
    `;function I(e){let t={...o,...e};return r.D(g,t)}let P=(0,n.Ps)`
    mutation RejectNotaryApplication($applicationId: String!, $reason: String) {
  rejectNotaryApplication(applicationId: $applicationId, reason: $reason) {
    id
    applicationNumber
    firstName
    middleName
    lastName
    email
    phone
    status
    appliedAt
    reviewedAt
  }
}
    `;function A(e){let t={...o,...e};return r.D(P,t)}let N=(0,n.Ps)`
    mutation CreateOrder($input: CheckoutInput!) {
  createOrder(input: $input) {
    id
    orderNumber
    userId
    documentId
    type
    status
    basePrice
    deliveryFee
    discount
    totalAmount
    couponCode
    createdAt
    updatedAt
  }
}
    `;function h(e){let t={...o,...e};return r.D(N,t)}let S=(0,n.Ps)`
    mutation ApplyCoupon($documentId: String!, $code: String!) {
  applyCoupon(documentId: $documentId, code: $code) {
    basePrice
    deliveryFee
    subtotal
    discount
    total
    couponApplied
  }
}
    `;function b(e){let t={...o,...e};return r.D(S,t)}let D=(0,n.Ps)`
    mutation CreatePayment($orderId: String!) {
  createPayment(orderId: $orderId) {
    id
    orderId
    amount
    currency
    status
    method
    razorpayOrderId
    createdAt
  }
}
    `;function C(e){let t={...o,...e};return r.D(D,t)}let v=(0,n.Ps)`
    mutation ConfirmPayment($orderId: String!, $razorpayPaymentId: String!) {
  confirmPayment(orderId: $orderId, razorpayPaymentId: $razorpayPaymentId) {
    id
    orderId
    amount
    status
    method
    razorpayPaymentId
    paidAt
  }
}
    `;function T(e){let t={...o,...e};return r.D(v,t)}let q=(0,n.Ps)`
    query MyAppointments($status: String) {
  myAppointments(status: $status) {
    id
    userId
    notaryId
    documentType
    scheduledDate
    scheduledTime
    status
    meetingLink
    notes
    orderId
    amount
    createdAt
    updatedAt
  }
}
    `;function M(e){let t={...o,...e};return a.aM(q,t)}let k=(0,n.Ps)`
    query MyDeliveries {
  myDeliveries {
    id
    orderId
    documentName
    status
    courierPartner
    trackingNumber
    currentLocation
    expectedDelivery
    stages {
      name
      completed
      date
    }
    createdAt
  }
}
    `;function w(e){let t={...o,...e};return a.aM(k,t)}let x=(0,n.Ps)`
    query Document($id: String!) {
  document(id: $id) {
    id
    userId
    notaryId
    orderId
    templateId
    title
    category
    status
    formData
    completionPercentage
    currentStep
    pdfUrl
    createdAt
    updatedAt
  }
}
    `;function O(e){let t={...o,...e};return a.aM(x,t)}let V=(0,n.Ps)`
    query MyDocuments($filter: DocumentsFilterInput) {
  myDocuments(filter: $filter) {
    nodes {
      id
      userId
      templateId
      title
      category
      status
      completionPercentage
      currentStep
      createdAt
      updatedAt
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      totalCount
    }
  }
}
    `;function F(e){let t={...o,...e};return a.aM(V,t)}let z=(0,n.Ps)`
    query DocumentTemplates($category: String) {
  documentTemplates(category: $category) {
    id
    slug
    name
    category
    steps {
      id
      title
      fields
    }
    defaultValues
    fieldConfigs
    createdAt
    updatedAt
  }
}
    `;function L(e){let t={...o,...e};return a.aM(z,t)}let R=(0,n.Ps)`
    query DocumentTemplate($slug: String!) {
  documentTemplate(slug: $slug) {
    id
    slug
    name
    category
    steps {
      id
      title
      fields
    }
    defaultValues
    fieldConfigs
    createdAt
    updatedAt
  }
}
    `;function U(e){let t={...o,...e};return a.aM(R,t)}let j=(0,n.Ps)`
    query CheckoutSummary($documentId: String!, $couponCode: String) {
  checkoutSummary(documentId: $documentId, couponCode: $couponCode) {
    basePrice
    deliveryFee
    subtotal
    discount
    total
    couponApplied
  }
}
    `;function B(e){let t={...o,...e};return a.aM(j,t)}let E=(0,n.Ps)`
    query FAQs($category: String, $search: String) {
  faqs(category: $category, search: $search) {
    id
    category
    question
    answer
    createdAt
    updatedAt
  }
}
    `;function Y(e){let t={...o,...e};return a.aM(E,t)}(0,n.Ps)`
    query Notary($id: String!) {
  notary(id: $id) {
    id
    userId
    fullName
    email
    phone
    photoUrl
    licenseNumber
    barCouncilNumber
    barCouncilState
    enrollmentDate
    experience
    specialization
    languages
    location
    consultationFee
    rating
    reviewsCount
    completedSessions
    bio
    isVerified
    verificationDate
    createdAt
    updatedAt
  }
}
    `;let G=(0,n.Ps)`
    query Notaries($specialization: String, $location: String) {
  notaries(specialization: $specialization, location: $location) {
    id
    userId
    fullName
    email
    phone
    photoUrl
    specialization
    location
    consultationFee
    rating
    reviewsCount
    isVerified
    createdAt
  }
}
    `;function J(e){let t={...o,...e};return a.aM(G,t)}let K=(0,n.Ps)`
    query NotaryApplications($status: String, $limit: Int, $offset: Int) {
  notaryApplications(status: $status, limit: $limit, offset: $offset) {
    id
    applicationNumber
    userId
    firstName
    middleName
    lastName
    email
    phone
    licenseNumber
    barCouncilNumber
    experience
    specialization
    location
    status
    appliedAt
    reviewedAt
    createdAt
    updatedAt
  }
}
    `;function Q(e){let t={...o,...e};return a.aM(K,t)}(0,n.Ps)`
    query NotaryApplication($id: String!) {
  notaryApplication(id: $id) {
    id
    applicationNumber
    userId
    firstName
    middleName
    lastName
    email
    phone
    licenseNumber
    barCouncilNumber
    experience
    specialization
    location
    status
    appliedAt
    reviewedAt
    createdAt
    updatedAt
  }
}
    `,(0,n.Ps)`
    query MyNotaryApplication {
  myNotaryApplication {
    id
    applicationNumber
    userId
    firstName
    middleName
    lastName
    email
    phone
    status
    appliedAt
    reviewedAt
    createdAt
    updatedAt
  }
}
    `;let Z=(0,n.Ps)`
    query MyOrders($filter: OrdersFilterInput) {
  myOrders(filter: $filter) {
    nodes {
      id
      orderNumber
      userId
      documentId
      type
      status
      basePrice
      deliveryFee
      discount
      totalAmount
      couponCode
      createdAt
      updatedAt
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      totalCount
    }
  }
}
    `;function _(e){let t={...o,...e};return a.aM(Z,t)}let H=(0,n.Ps)`
    query Order($id: String!) {
  order(id: $id) {
    id
    orderNumber
    userId
    documentId
    type
    status
    basePrice
    deliveryFee
    discount
    totalAmount
    couponCode
    createdAt
    updatedAt
  }
}
    `;function W(e){let t={...o,...e};return a.aM(H,t)}let X=(0,n.Ps)`
    query PricingPlans {
  pricingPlans {
    id
    name
    price
    amount
    period
    features
    popular
    cta
    createdAt
    updatedAt
  }
}
    `;function ee(e){let t={...o,...e};return a.aM(X,t)}let et=(0,n.Ps)`
    query Services {
  services {
    id
    name
    description
    price
    basePrice
    deliveryFee
    flow
    features
    includes
    popular
    createdAt
    updatedAt
  }
}
    `;function ei(e){let t={...o,...e};return a.aM(et,t)}let en=(0,n.Ps)`
    query Me {
  me {
    id
    name
    email
    phone
    role
    status
    emailVerified
    phoneVerified
    permissions
    createdAt
    updatedAt
  }
}
    `;function er(e){let t={...o,...e};return a.aM(en,t)}(0,n.Ps)`
    query User($id: String!) {
  user(id: $id) {
    id
    name
    email
    phone
    role
    status
    emailVerified
    phoneVerified
    permissions
    createdAt
    updatedAt
  }
}
    `}};