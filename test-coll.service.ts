// Test temporal para verificar CollService
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CollService } from './src/app/features/coll/services/coll.service';
import { ApiConfigService } from './src/app/core/services/api/api-config.service';

// Mock del ApiConfigService
class MockApiConfigService {
    private mockEndpoint = {
        id: 8,
        name: 'admcoll',
        url: 'http://localhost:3000/api/admcoll/v1'
    };

    waitForEndpoints(): Promise<void> {
        return Promise.resolve();
    }

    getEndpointById(id: number) {
        return id === 8 ? this.mockEndpoint : undefined;
    }
}

describe('CollService', () => {
    let service: CollService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                CollService,
                { provide: ApiConfigService, useClass: MockApiConfigService }
            ]
        });

        service = TestBed.inject(CollService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should get all collections', (done) => {
        const mockResponse = {
            statuscode: 200,
            mensaje: 'ok',
            data: [{
                id_coll: 12,
                nombre: 'receta',
                descripcion: 'para nestle',
                products: 0,
                swtag: 0,
                swsrc: 0,
                estado: 'A',
                fecha_ini: '2025-09-04T18:28:21.550',
                fecha_fin: '2025-09-04T18:28:21.550',
                fecha_mod: '2025-09-04T18:16:25.647',
                fecha_a: '2025-09-04T18:16:25.647',
                usr_a: '280',
                usr_m: '280',
                sw_fijo: 0,
                url_banner: null,
                id_tipoc: 1
            }]
        };

        service.getAllCollections().subscribe(response => {
            expect(response.statuscode).toBe(200);
            expect(response.data.length).toBe(1);
            expect(response.data[0].nombre).toBe('receta');
            done();
        });

        const req = httpMock.expectOne('http://localhost:3000/api/admcoll/v1');
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should handle endpoint not found', (done) => {
        // Mock para endpoint no encontrado
        spyOn(TestBed.inject(ApiConfigService), 'getEndpointById').and.returnValue(undefined);

        service.getAllCollections().subscribe({
            next: () => fail('Should have thrown error'),
            error: (error) => {
                expect(error.message).toContain('Endpoint de colecciones no encontrado');
                done();
            }
        });
    });
});

