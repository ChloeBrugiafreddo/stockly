import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectDB } from '@/lib/mongodb'
import Company from '@/models/Company'
import User from '@/models/User'
import Product from '@/models/Product'
import Invoice from '@/models/Invoice'
import Production from '@/models/Production'
import Sector from '@/models/Sector'
import StockMovement from '@/models/StockMovement'

async function checkSuperAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get('sa_session')
  return session?.value === 'authenticated'
}

export async function GET() {
  if (!await checkSuperAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  await connectDB()

  const [companies, users, products, invoices, productions, movements] = await Promise.all([
    Company.countDocuments(),
    User.countDocuments(),
    Product.countDocuments(),
    Invoice.countDocuments(),
    Production.countDocuments(),
    StockMovement.countDocuments(),
    ])
    const sectors = await Sector.find().lean()

  // Récupère les entreprises sans populate
  const companiesList = await Company.find().lean() as any[]

  // Enrichit manuellement avec le secteur
  const companiesDetail = await Promise.all(
    companiesList.map(async (company) => {
      const sector = sectors.find((s: any) =>
        s._id.toString() === company.sectorId?.toString()
      )
      const [userCount, productCount, invoiceCount, productionCount] = await Promise.all([
        User.countDocuments({ companyId: company._id }),
        Product.countDocuments({ companyId: company._id }),
        Invoice.countDocuments({ companyId: company._id }),
        Production.countDocuments({ companyId: company._id }),
      ])
      return {
        _id: company._id,
        name: company.name,
        sector: sector || null,
        userCount,
        productCount,
        invoiceCount,
        productionCount,
        createdAt: company.createdAt,
      }
    })
  )

  // Groupe par secteur
  const sectorMap: Record<string, any> = {}
  companiesDetail.forEach(company => {
    const sectorName = company.sector?.name || 'Sans secteur'
    if (!sectorMap[sectorName]) {
      sectorMap[sectorName] = {
        name: sectorName,
        color: company.sector?.theme?.primary || '#64748b',
        icon: company.sector?.icons?.product || '📦',
        count: 0,
      }
    }
    sectorMap[sectorName].count++
  })

  return NextResponse.json({
    companies,
    users,
    products,
    invoices,
    productions,
    movements,
    sectors: sectors.length,
    sectorStats: Object.values(sectorMap),
    companiesDetail,
  })
}